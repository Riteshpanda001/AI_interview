import asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from app.services.otp_service import OTPService
from app.services.auth_service import AuthService
from app.schemas.auth_schema import RequestEmailChangeRequest, VerifyEmailChangeRequest

def test_otp_sha256_hashing():
    async def run():
        raw_code = "123456"
        email = "secure@example.com"
        purpose = "email_verification"
        
        # Test hash generation
        h1 = OTPService._hash_otp(raw_code, email, purpose)
        h2 = OTPService._hash_otp(raw_code, email, purpose)
        assert h1 == h2
        
        # Salt variation test
        h_diff_email = OTPService._hash_otp(raw_code, "other@example.com", purpose)
        assert h1 != h_diff_email

    asyncio.run(run())

def test_account_lockout_after_failed_attempts():
    async def run():
        mock_db = MagicMock()
        mock_db["users"] = MagicMock()
        mock_db["audit_logs"] = MagicMock()
        mock_db["login_activity"] = MagicMock()
        
        mock_db["audit_logs"].insert_one = AsyncMock()
        mock_db["login_activity"].insert_one = AsyncMock()
        mock_db["users"].update_one = AsyncMock()
        
        user_doc = {
            "_id": "60d5ec49f83a2c2b3c4d5e6f",
            "email": "lockout@example.com",
            "hashed_password": AuthService.get_password_hash("CorrectPassword123!"),
            "failed_login_attempts": 4,
            "is_verified": True,
            "is_active": True
        }
        mock_db["users"].find_one = AsyncMock(return_value=user_doc)

        # 5th failed attempt should trigger lockout
        with pytest.raises(HTTPException) as exc_info:
            await AuthService.authenticate_user("lockout@example.com", "WrongPassword!", mock_db)
        assert exc_info.value.status_code == 401

        # Check update_one called to increment failed_login_attempts and set lockout_until
        mock_db["users"].update_one.assert_called()
        call_args = mock_db["users"].update_one.call_args[0][1]["$set"]
        assert call_args["failed_login_attempts"] == 5
        assert "lockout_until" in call_args

    asyncio.run(run())

def test_refresh_token_rotation_and_theft_detection():
    async def run():
        mock_db = MagicMock()
        mock_refresh_tokens = MagicMock()
        mock_sessions = MagicMock()
        mock_audit_logs = MagicMock()

        mock_db.__getitem__.side_effect = lambda key: {
            "refresh_tokens": mock_refresh_tokens,
            "sessions": mock_sessions,
            "audit_logs": mock_audit_logs
        }.get(key, MagicMock())

        mock_audit_logs.insert_one = AsyncMock()
        mock_refresh_tokens.update_many = AsyncMock()
        mock_sessions.update_many = AsyncMock()

        # Simulate a revoked token presentation
        revoked_token_record = {
            "jti": "stolen-jti-123",
            "user_id": "60d5ec49f83a2c2b3c4d5e6f",
            "is_revoked": True
        }
        mock_refresh_tokens.find_one = AsyncMock(return_value=revoked_token_record)

        with patch("app.services.jwt_service.JWTService.decode_token") as mock_decode, \
             patch("app.services.user_service.UserService.find_by_id") as mock_find_user:
            
            mock_decode.return_value = {
                "type": "refresh",
                "sub": "60d5ec49f83a2c2b3c4d5e6f",
                "jti": "stolen-jti-123"
            }
            mock_find_user.return_value = {
                "_id": "60d5ec49f83a2c2b3c4d5e6f",
                "email": "user@example.com",
                "is_active": True
            }

            with pytest.raises(HTTPException) as exc_info:
                await AuthService.refresh_token("fake_refresh_token", mock_db)

            assert exc_info.value.status_code == 401
            assert "Token reuse detected" in exc_info.value.detail
            mock_refresh_tokens.update_many.assert_called_once()
            mock_sessions.update_many.assert_called_once()

    asyncio.run(run())
