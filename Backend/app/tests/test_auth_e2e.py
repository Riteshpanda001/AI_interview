import asyncio
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.services.auth_service import AuthService
from app.services.jwt_service import JWTService
from app.services.otp_service import OTPService
from app.schemas.auth_schema import UserRegisterRequest

def test_password_hashing_and_complexity():
    # Password complexity validation
    with pytest.raises(HTTPException) as exc1:
        AuthService.validate_password_complexity("weak")
    assert "at least 8 characters" in str(exc1.value.detail)

    with pytest.raises(HTTPException) as exc2:
        AuthService.validate_password_complexity("alllowercase123!")
    assert "uppercase letter" in str(exc2.value.detail)

    # Valid password hash & verification
    hashed = AuthService.get_password_hash("StrongP@ss123")
    assert AuthService.verify_password("StrongP@ss123", hashed)
    assert not AuthService.verify_password("WrongP@ss123", hashed)

def test_e2e_register_otp_and_login_flow():
    async def run():
        mock_db = MagicMock()
        mock_db["users"].find_one = AsyncMock(return_value=None)
        mock_db["users"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="user_e2e_101"))
        mock_db["otp_codes"].update_one = AsyncMock()
        mock_db["login_activity"].insert_one = AsyncMock()
        mock_db["sessions"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="sess_101"))
        mock_db["refresh_tokens"].insert_one = AsyncMock()
        mock_db["audit_logs"].insert_one = AsyncMock()

        reg_req = UserRegisterRequest(
            full_name="E2E Tester",
            email="e2e_candidate@prepnova.ai",
            password="SecurePassword123!",
            confirm_password="SecurePassword123!"
        )

        with patch("app.services.email_service.EmailService.send_email", new=AsyncMock(return_value=True)):
            res = await AuthService.register_user(reg_req, mock_db)
            assert res["success"] is True

        # Mock OTP verification
        hashed_pwd = AuthService.get_password_hash("SecurePassword123!")
        user_record = {
            "_id": "user_e2e_101",
            "email": "e2e_candidate@prepnova.ai",
            "full_name": "E2E Tester",
            "hashed_password": hashed_pwd,
            "is_verified": True,
            "is_active": True,
            "failed_login_attempts": 0,
            "lockout_until": None,
            "role": "user",
            "plan_type": "pro"
        }
        mock_db["users"].find_one = AsyncMock(return_value=user_record)

        tokens = await AuthService.authenticate_user("e2e_candidate@prepnova.ai", "SecurePassword123!", mock_db)
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert tokens["role"] == "user"
        assert tokens["is_verified"] is True

    asyncio.run(run())

def test_e2e_refresh_token_rotation_and_reuse_detection():
    async def run():
        mock_db = MagicMock()
        valid_user_id = "507f1f77bcf86cd799439011"
        mock_user = {
            "_id": valid_user_id,
            "email": "reuse_test@prepnova.ai",
            "is_active": True,
            "role": "user",
            "plan_type": "free"
        }
        mock_db["users"].find_one = AsyncMock(return_value=mock_user)
        mock_db["refresh_tokens"].insert_one = AsyncMock()
        mock_db["refresh_tokens"].update_one = AsyncMock()
        mock_db["refresh_tokens"].update_many = AsyncMock()
        mock_db["sessions"].update_many = AsyncMock()
        mock_db["audit_logs"].insert_one = AsyncMock()

        # Step 1: Issue token pair
        pair1 = await AuthService._issue_token_pair(valid_user_id, session_id="sess_202", db=mock_db)
        ref_token_str = pair1["refresh_token"]

        # Step 2: Perform normal token rotation
        mock_db["refresh_tokens"].find_one = AsyncMock(return_value={"jti": pair1["jti"], "is_revoked": False})
        pair2 = await AuthService.refresh_token(ref_token_str, mock_db)
        assert pair2["access_token"] is not None

        # Step 3: Attempt REUSE of old rotated refresh token -> Must trigger security theft alert & 401
        mock_db["refresh_tokens"].find_one = AsyncMock(return_value={"jti": pair1["jti"], "is_revoked": True})
        with pytest.raises(HTTPException) as exc:
            await AuthService.refresh_token(ref_token_str, mock_db)
        assert exc.value.status_code == 401
        assert "Token reuse detected" in str(exc.value.detail)

    asyncio.run(run())

def test_e2e_account_lockout_protection():
    async def run():
        mock_db = MagicMock()
        now = datetime.now(timezone.utc)
        
        # User with 4 failed attempts
        mock_user = {
            "_id": "user_e2e_303",
            "email": "lockout_candidate@prepnova.ai",
            "hashed_password": AuthService.get_password_hash("CorrectPassword123!"),
            "failed_login_attempts": 4,
            "lockout_until": None,
            "is_verified": True,
            "is_active": True
        }
        mock_db["users"].find_one = AsyncMock(return_value=mock_user)
        mock_db["users"].update_one = AsyncMock()
        mock_db["login_activity"].insert_one = AsyncMock()
        mock_db["audit_logs"].insert_one = AsyncMock()

        # 5th failed attempt should lock account
        with pytest.raises(HTTPException) as exc:
            await AuthService.authenticate_user("lockout_candidate@prepnova.ai", "WrongPassword!", mock_db)
        assert exc.value.status_code == 401

        # Locked account attempt should return 429
        locked_user = {
            **mock_user,
            "failed_login_attempts": 5,
            "lockout_until": now + timedelta(minutes=15)
        }
        mock_db["users"].find_one = AsyncMock(return_value=locked_user)

        with pytest.raises(HTTPException) as exc_lock:
            await AuthService.authenticate_user("lockout_candidate@prepnova.ai", "CorrectPassword123!", mock_db)
        assert exc_lock.value.status_code == 429
        assert "temporarily locked" in str(exc_lock.value.detail)

    asyncio.run(run())

def test_e2e_token_revocation_and_logout():
    async def run():
        mock_db = MagicMock()
        mock_db["refresh_tokens"].update_one = AsyncMock()
        mock_db["audit_logs"].insert_one = AsyncMock()

        token_str = JWTService.create_access_token({"sub": "user_404"})
        res = await AuthService.logout_user(token_str, mock_db)
        assert res["success"] is True

    asyncio.run(run())

def test_e2e_google_account_linking():
    async def run():
        mock_db = MagicMock()
        existing_local_user = {
            "_id": "507f1f77bcf86cd799439022",
            "email": "local_candidate@prepnova.ai",
            "full_name": "Local Candidate",
            "hashed_password": "hashed_pass_secret",
            "provider": "email",
            "auth_provider": "local",
            "is_verified": False
        }
        mock_db["users"].find_one = AsyncMock(return_value=existing_local_user)
        mock_db["users"].update_one = AsyncMock()
        mock_db["sessions"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="sess_606"))
        mock_db["refresh_tokens"].insert_one = AsyncMock()
        mock_db["login_activity"].insert_one = AsyncMock()
        mock_db["audit_logs"].insert_one = AsyncMock()

        fake_profile = {
            "google_id": "google_998877",
            "email": "local_candidate@prepnova.ai",
            "name": "Local Candidate",
            "picture": "https://lh3.googleusercontent.com/a/photo2.jpg"
        }

        with patch("app.services.google_auth.GoogleAuthService.verify_google_token", new=AsyncMock(return_value=fake_profile)):
            tokens = await AuthService.google_login("fake_google_cred", mock_db)
            assert "access_token" in tokens
            assert tokens["is_verified"] is True
            # Verify update_one was called to link google_id and update auth_provider to local+google
            assert mock_db["users"].update_one.called
            call_args = mock_db["users"].update_one.call_args[0][1]["$set"]
            assert call_args["auth_provider"] == "local+google"
            assert call_args["google_id"] == "google_998877"

    asyncio.run(run())

def test_e2e_2step_password_reset_flow():
    async def run():
        mock_db = MagicMock()
        user_record = {
            "_id": "507f1f77bcf86cd799439033",
            "email": "reset_test@prepnova.ai",
            "full_name": "Reset Candidate",
            "hashed_password": "old_hashed_password"
        }
        mock_db["users"].find_one = AsyncMock(return_value=user_record)
        mock_db["users"].update_one = AsyncMock()
        mock_db["password_reset_tokens"].find_one = AsyncMock(return_value={
            "reset_token": "valid_reset_token_123",
            "email": "reset_test@prepnova.ai",
            "used": False,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10)
        })
        mock_db["password_reset_tokens"].update_one = AsyncMock()
        mock_db["sessions"].update_many = AsyncMock()
        mock_db["refresh_tokens"].update_many = AsyncMock()
        mock_db["audit_logs"].insert_one = AsyncMock()

        res = await AuthService.reset_password(
            email="reset_test@prepnova.ai",
            new_password="NewSecurePassword123!",
            reset_token="valid_reset_token_123",
            db=mock_db
        )
        assert res["success"] is True
        assert mock_db["users"].update_one.called

    asyncio.run(run())

def test_e2e_mobile_otp_verification():
    async def run():
        mock_db = MagicMock()
        mock_db["otps"].find_one = AsyncMock(return_value=None)
        mock_db["otps"].insert_one = AsyncMock()
        mock_db["otps"].delete_many = AsyncMock()
        mock_db["users"].update_one = AsyncMock()
        mock_db["audit_logs"].insert_one = AsyncMock()

        with patch("app.database.db_manager.db", mock_db):
            # Step 1: Send Mobile OTP
            with patch("app.services.sms_service.SMSService.send_otp_sms", new=AsyncMock(return_value=True)):
                code = await OTPService.send_mobile_otp("+919876543210", user_id="user_mobile_101")
                assert len(code) == 6

            # Step 2: Verify Mobile OTP
            mock_otp_record = {
                "_id": "otp_m_1",
                "email": "+919876543210",
                "otp_hash": OTPService._hash_otp(code, "+919876543210", "mobile_verification"),
                "purpose": "mobile_verification",
                "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
                "attempts": 0
            }
            mock_db["otps"].find_one = AsyncMock(return_value=mock_otp_record)

            res = await OTPService.verify_mobile_otp("+919876543210", code, user_id="user_mobile_101")
            assert res["success"] is True
            assert res["phone_verified"] is True

    asyncio.run(run())

