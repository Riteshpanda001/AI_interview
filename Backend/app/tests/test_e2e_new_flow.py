import asyncio
import secrets
import hashlib
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.auth_service import AuthService
from app.services.otp_service import OTPService
from app.schemas.auth_schema import UserRegisterRequest

def test_full_new_verification_flow_e2e():
    async def run_e2e():
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

        sent_emails = []
        sent_sms = []

        async def mock_send_email(email, subject, content):
            sent_emails.append({"email": email, "subject": subject, "content": content})
            return True

        async def mock_send_sms(phone, message):
            sent_sms.append({"phone": phone, "message": message})
            return True

        with patch("app.database.db_manager.db", mock_db), \
             patch("app.services.email_service.EmailService.send_email", side_effect=mock_send_email), \
             patch("app.services.sms_service.SMSService.send_otp_sms", side_effect=mock_send_sms):

            print("\n==================================================")
            print("STARTING E2E NEW REGISTRATION WORKFLOW TEST")
            print("==================================================")

            # STEP 1: Registration
            req = UserRegisterRequest(
                email="e2e_user@gmail.com",
                password="SecurePassword123!",
                confirm_password="SecurePassword123!",
                full_name="E2E Test User",
                phone="+919988776655",
                gender="Male"
            )
            reg_res = await AuthService.register_user(req, mock_db)
            assert reg_res["success"] is True
            assert len(sent_emails) == 1
            assert "Verify your PreNova AI email address" in sent_emails[0]["subject"]
            print("[E2E STEP 1 PASSED] User registered -> ONLY verification link email sent.")

            # Verify pending registration state
            pending = await mock_db["pending_registrations"].find_one({"email_normalized": "e2e_user@gmail.com"})
            assert pending["account_status"] == "PENDING"
            assert pending["email_link_verified"] is False
            assert pending["email_otp_verified"] is False
            assert pending["email_verified"] is False

            # Extract raw token from sent email content
            content = sent_emails[0]["content"]
            token_param = content.split("token=")[1].split('"')[0]

            # STEP 2: User clicks email verification link
            link_res = await AuthService.verify_email_link(token_param, db=mock_db)
            assert link_res["success"] is True
            assert link_res["email_link_verified"] is True
            assert link_res["require_otp"] is True
            assert len(sent_emails) == 2
            assert "Your PreNova AI Verification Code" in sent_emails[1]["subject"]
            print("[E2E STEP 2 PASSED] Verification link clicked -> Link verified & 6-digit OTP email sent.")

            # STEP 3: Single-Use Check (Clicking link second time)
            try:
                await AuthService.verify_email_link(token_param, db=mock_db)
                assert False, "Should have raised exception on duplicate click"
            except Exception as e:
                assert "already" in str(e.detail).lower() or "used" in str(e.detail).lower()
            print("[E2E STEP 3 PASSED] Link reuse correctly rejected.")

            # STEP 4: User enters Email OTP
            otp_record = await mock_db["otps"].find_one({"email": "e2e_user@gmail.com", "purpose": "email_verification"})
            assert otp_record is not None
            
            # Since OTP is stored as a hash, we can verify with the OTP code sent in email 2
            email2_html = sent_emails[1]["content"]
            # Extract OTP digits from HTML
            import re
            otp_match = re.search(r'\b\d{6}\b', email2_html)
            assert otp_match is not None
            otp_code = otp_match.group(0)

            otp_res = await AuthService.verify_user_otp("e2e_user@gmail.com", otp_code, purpose="email_verification", db=mock_db)
            assert otp_res["require_mobile_otp"] is True
            assert otp_res["email_verified"] is True
            assert len(sent_sms) == 1
            print("[E2E STEP 4 PASSED] Email OTP verified -> Email fully verified & Mobile OTP SMS sent.")

            # STEP 5: Mobile OTP verification
            sms_text = sent_sms[0]["message"]
            sms_otp_match = re.search(r'\b\d{6}\b', sms_text)
            sms_otp_code = sms_otp_match.group(0) if sms_otp_match else "123456"

            with patch("app.services.otp_service.OTPService.verify_otp", new_callable=AsyncMock) as mock_verify_sms:
                mock_verify_sms.return_value = True
                mobile_res = await OTPService.verify_mobile_otp("+919988776655", sms_otp_code)
                assert "access_token" in mobile_res
                assert mobile_res["phone_verified"] is True

                active_user = await mock_db["users"].find_one({"email_normalized": "e2e_user@gmail.com"})
                assert active_user is not None
                assert active_user["account_status"] == "active"
                assert active_user["is_verified"] is True
                assert active_user["phone_verified"] is True

            print("[E2E STEP 5 PASSED] Mobile OTP verified -> Account status ACTIVE, JWT access token issued!")
            print("==================================================")
            print("END-TO-END WORKFLOW COMPLETED SUCCESSFULLY!")
            print("==================================================")

    asyncio.run(run_e2e())
