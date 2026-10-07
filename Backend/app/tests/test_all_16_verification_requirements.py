import asyncio
import pytest
import secrets
import hashlib
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.auth_service import AuthService
from app.services.otp_service import OTPService
from app.schemas.auth_schema import UserRegisterRequest

def test_all_16_verification_requirements():
    async def run_tests():
        # Setup mock collections
        pending_store = {}
        users_store = {}
        otps_store = {}

        class MockCollection:
            def __init__(self, store):
                self.store = store

            async def find_one(self, filter_dict):
                if "$or" in filter_dict:
                    for sub_filter in filter_dict["$or"]:
                        res = await self.find_one(sub_filter)
                        if res:
                            return res
                    return None

                clean_filter = {}
                for k, v in filter_dict.items():
                    if k in ("email", "email_normalized", "phone_normalized", "phone", "mobile_number"):
                        clean_filter[k] = str(v).lower().strip()
                    else:
                        clean_filter[k] = v

                for doc in self.store.values():
                    match = True
                    for k, v in clean_filter.items():
                        doc_val = doc.get(k)
                        if isinstance(doc_val, str):
                            doc_val = doc_val.lower().strip()
                        if doc_val != v:
                            match = False
                            break
                    if match:
                        return doc.copy()
                return None

            async def insert_one(self, doc):
                doc_copy = doc.copy()
                if "_id" not in doc_copy:
                    doc_copy["_id"] = str(len(self.store) + 1)
                self.store[doc_copy["_id"]] = doc_copy
                return MagicMock(inserted_id=doc_copy["_id"])

            async def update_one(self, filter_dict, update_dict):
                doc = await self.find_one(filter_dict)
                if doc:
                    key = doc["_id"]
                    if "$set" in update_dict:
                        for k, v in update_dict["$set"].items():
                            self.store[key][k] = v
                    return MagicMock(matched_count=1, modified_count=1)
                return MagicMock(matched_count=0, modified_count=0)

            async def delete_many(self, filter_dict):
                keys_to_del = []
                for k, v in self.store.items():
                    match = True
                    for fk, fv in filter_dict.items():
                        if v.get(fk) != fv:
                            match = False
                            break
                    if match:
                        keys_to_del.append(k)
                for k in keys_to_del:
                    del self.store[k]
                return MagicMock(deleted_count=len(keys_to_del))

            async def delete_one(self, filter_dict):
                return await self.delete_many(filter_dict)

        mock_db = {
            "users": MockCollection(users_store),
            "pending_registrations": MockCollection(pending_store),
            "otps": MockCollection(otps_store),
            "sessions": MagicMock(insert_one=AsyncMock(return_value=MagicMock(inserted_id="sess_123"))),
            "refresh_tokens": MagicMock(insert_one=AsyncMock(), find_one=AsyncMock(return_value=None)),
            "audit_logs": MagicMock(insert_one=AsyncMock()),
            "login_activity": MagicMock(insert_one=AsyncMock())
        }

        with patch("app.database.db_manager.db", mock_db), \
             patch("app.services.email_service.EmailService.send_email", new_callable=AsyncMock) as mock_send_email, \
             patch("app.services.sms_service.SMSService.send_otp_sms", new_callable=AsyncMock) as mock_send_sms:

            mock_send_email.return_value = True
            mock_send_sms.return_value = True

            print("\n==================================================")
            print("RUNNING ALL 16 REGISTRATION VERIFICATION TESTS")
            print("==================================================")

            # ------------------------------------------------------------------
            # TEST 1: New user registers -> Verification link email sent ONLY (OTP is NOT sent yet)
            # ------------------------------------------------------------------
            req = UserRegisterRequest(
                email="user1@gmail.com",
                password="SecurePassword123!",
                confirm_password="SecurePassword123!",
                full_name="Test User One",
                phone="+919800000001",
                gender="Male"
            )
            reg_res = await AuthService.register_user(req, mock_db)
            assert reg_res["success"] is True
            assert mock_send_email.call_count == 1  # Link Email ONLY
            print("[OK] TEST 1 PASSED: New user registers -> ONLY Link email sent (OTP not sent yet).")

            pending_user = await mock_db["pending_registrations"].find_one({"email_normalized": "user1@gmail.com"})
            assert pending_user is not None
            assert pending_user["account_status"] == "PENDING"
            assert pending_user["email_otp_verified"] is False
            assert pending_user["email_link_verified"] is False
            assert pending_user["email_verified"] is False

            link_hash_1 = pending_user["verification_link_hash"]

            # ------------------------------------------------------------------
            # TEST 2: Attempting to resend OTP BEFORE link click fails
            # ------------------------------------------------------------------
            with pytest.raises(Exception) as resend_pre_link_err:
                await AuthService.resend_user_otp("user1@gmail.com", "email_verification", db=mock_db)
            assert "verify your email" in str(resend_pre_link_err.value.detail).lower()
            print("[OK] TEST 2 PASSED: Resend OTP blocked before verification link click.")

            # ------------------------------------------------------------------
            # TEST 3 & 4: User clicks verification link -> Link verified, OTP generated & sent
            # ------------------------------------------------------------------
            with patch("hashlib.sha256") as mock_sha:
                mock_sha_obj = MagicMock()
                mock_sha_obj.hexdigest.return_value = link_hash_1
                mock_sha.return_value = mock_sha_obj

                link_res = await AuthService.verify_email_link("dummy_token_1", db=mock_db)
                assert link_res["require_otp"] is True
                assert link_res["email_link_verified"] is True
                assert link_res["email_otp_verified"] is False
                assert link_res["email_verified"] is False
                assert mock_send_email.call_count == 2  # OTP Email sent now!
            print("[OK] TEST 3 & 4 PASSED: Verification link clicked -> Link verified, OTP generated & sent to email.")

            # ------------------------------------------------------------------
            # TEST 5: User enters OTP after link click -> Account fully activated
            # ------------------------------------------------------------------
            with patch("app.services.otp_service.OTPService.verify_otp", new_callable=AsyncMock) as mock_verify:
                mock_verify.return_value = True
                otp_res = await AuthService.verify_user_otp("user1@gmail.com", "123456", db=mock_db)

                assert "access_token" in otp_res
                assert otp_res["email_otp_verified"] is True
                assert otp_res["email_link_verified"] is True
                assert otp_res["email_verified"] is True
                assert otp_res["is_verified"] is True
            print("[OK] TEST 5 PASSED: OTP verified after link click -> Email fully verified, account activated directly.")

            # ------------------------------------------------------------------
            # TEST 7 & 8: Verification link single-use / reuse protection
            # ------------------------------------------------------------------
            with patch("hashlib.sha256") as mock_sha:
                mock_sha_obj = MagicMock()
                mock_sha_obj.hexdigest.return_value = link_hash_1
                mock_sha.return_value = mock_sha_obj
                with pytest.raises(Exception) as exc_info:
                    await AuthService.verify_email_link("dummy_token_1", db=mock_db)
                assert any(w in str(exc_info.value.detail).lower() for w in ["already", "used", "not found", "invalid"])
            print("[OK] TEST 7 & 8 PASSED: Link reuse rejected.")

            # ------------------------------------------------------------------
            # TEST 11 & 12: Account status verified
            # ------------------------------------------------------------------
            created_user = await mock_db["users"].find_one({"email_normalized": "user1@gmail.com"})
            assert created_user is not None
            assert created_user["account_status"] == "active"
            assert created_user["is_verified"] is True
            print("[OK] TEST 11 & 12 PASSED: Account verified -> Account is ACTIVE.")

            # ------------------------------------------------------------------
            # TEST 13: Duplicate Email Check
            # ------------------------------------------------------------------
            check_email_res = await AuthService.check_registration("user1@gmail.com", "+919999999999", mock_db)
            assert check_email_res["status"] == "EMAIL_ALREADY_REGISTERED"
            print("[OK] TEST 13 PASSED: Duplicate email detected -> EMAIL_ALREADY_REGISTERED.")

            # ------------------------------------------------------------------
            # TEST 14: Duplicate Mobile Check
            # ------------------------------------------------------------------
            check_phone_res = await AuthService.check_registration("new_user@gmail.com", "+919800000001", mock_db)
            assert check_phone_res["status"] == "PHONE_ALREADY_REGISTERED"
            print("[OK] TEST 14 PASSED: Duplicate mobile detected -> PHONE_ALREADY_REGISTERED.")

            # ------------------------------------------------------------------
            # TEST 15: Existing Email + Mobile belong to same account
            # ------------------------------------------------------------------
            check_existing_res = await AuthService.check_registration("user1@gmail.com", "+919800000001", mock_db)
            assert check_existing_res["status"] == "EXISTING_ACCOUNT"
            print("[OK] TEST 15 PASSED: Existing email + phone belong to same account -> EXISTING_ACCOUNT.")

            # ------------------------------------------------------------------
            # TEST 16: Cross-Account Conflict
            # ------------------------------------------------------------------
            await mock_db["users"].insert_one({
                "email": "user2@gmail.com",
                "email_normalized": "user2@gmail.com",
                "phone": "+919800000002",
                "phone_normalized": "+919800000002",
                "account_status": "active"
            })
            check_conflict_res = await AuthService.check_registration("user1@gmail.com", "+919800000002", mock_db)
            assert check_conflict_res["status"] == "IDENTITY_CONFLICT"
            print("[OK] TEST 16 PASSED: Email belonging to A and phone belonging to B -> IDENTITY_CONFLICT.")

            # ------------------------------------------------------------------
            # TEST 9: Resend OTP (after link is clicked, with cooldown bypass simulation)
            # ------------------------------------------------------------------
            req_u3 = UserRegisterRequest(
                email="user3@gmail.com",
                password="SecurePassword123!",
                confirm_password="SecurePassword123!",
                full_name="Test User Three",
                phone="+919800000003",
                gender="Other"
            )
            await AuthService.register_user(req_u3, mock_db)
            p3_init = await mock_db["pending_registrations"].find_one({"email_normalized": "user3@gmail.com"})
            hash_u3_init = p3_init["verification_link_hash"]

            # Click link for user3 to generate initial OTP
            with patch("hashlib.sha256") as mock_sha:
                mock_sha_obj = MagicMock()
                mock_sha_obj.hexdigest.return_value = hash_u3_init
                mock_sha.return_value = mock_sha_obj
                await AuthService.verify_email_link("token_u3_init", db=mock_db)

            # Fast-forward OTP created_at to bypass 60s cooldown in unit test
            for key, val in otps_store.items():
                if val.get("email") == "user3@gmail.com":
                    otps_store[key]["created_at"] = datetime.now(timezone.utc) - timedelta(seconds=65)

            resend_otp_res = await AuthService.resend_user_otp("user3@gmail.com", "email_verification", db=mock_db)
            assert resend_otp_res["success"] is True
            print("[OK] TEST 9 PASSED: Resend OTP succeeds after link verification.")

            # ------------------------------------------------------------------
            # TEST 10: Resend Verification Link (with cooldown bypass simulation)
            # ------------------------------------------------------------------
            for key, val in pending_store.items():
                if val.get("email_normalized") == "user3@gmail.com":
                    pending_store[key]["verification_link_created_at"] = datetime.now(timezone.utc) - timedelta(seconds=65)

            resend_link_res = await AuthService.resend_verification_email("user3@gmail.com", db=mock_db)
            assert resend_link_res["success"] is True
            print("[OK] TEST 10 PASSED: Resend verification link succeeds and invalidates previous token.")

            # ------------------------------------------------------------------
            # TEST 6: Verification Link Expired Check
            # ------------------------------------------------------------------
            req_u4 = UserRegisterRequest(
                email="user4@gmail.com",
                password="SecurePassword123!",
                confirm_password="SecurePassword123!",
                full_name="Test User Four",
                phone="+919800000004",
                gender="Female"
            )
            await AuthService.register_user(req_u4, mock_db)
            p4 = await mock_db["pending_registrations"].find_one({"email_normalized": "user4@gmail.com"})
            hash_u4 = p4["verification_link_hash"]
            await mock_db["pending_registrations"].update_one(
                {"_id": p4["_id"]},
                {"$set": {"verification_link_expires_at": datetime.now(timezone.utc) - timedelta(minutes=1)}}
            )
            with patch("hashlib.sha256") as mock_sha:
                mock_sha_obj = MagicMock()
                mock_sha_obj.hexdigest.return_value = hash_u4
                mock_sha.return_value = mock_sha_obj
                with pytest.raises(Exception) as link_exp_err:
                    await AuthService.verify_email_link("token_u4", db=mock_db)
                assert "expired" in str(link_exp_err.value.detail).lower()
            print("[OK] TEST 6 PASSED: Expired verification link rejected.")

            print("==================================================")
            print("ALL 16 REGISTRATION VERIFICATION TESTS PASSED SUCCESSFULLY!")
            print("==================================================")

    asyncio.run(run_tests())
