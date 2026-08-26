import asyncio
import pytest
import pyotp
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from app.services.totp_service import TOTPService
from app.services.auth_service import AuthService

def test_totp_service_secret_and_uri():
    secret = TOTPService.generate_secret()
    assert len(secret) == 32
    # Verify base32 structure (only A-Z and 2-7)
    import re
    assert re.match(r"^[A-Z2-7]+$", secret)

    uri = TOTPService.get_provisioning_uri(secret, "test.candidate@prepnova.ai")
    assert "otpauth://totp/" in uri
    assert "test.candidate%40prepnova.ai" in uri
    assert "PreNova%20AI" in uri

def test_totp_service_verification():
    secret = TOTPService.generate_secret()
    totp = pyotp.totp.TOTP(secret)
    current_code = totp.now()

    # Valid code
    assert TOTPService.verify_code(secret, current_code) is True
    # Invalid code
    assert TOTPService.verify_code(secret, "000000") is False
    # Badly formatted code
    assert TOTPService.verify_code(secret, "12345") is False
    assert TOTPService.verify_code(secret, "abcdef") is False

def test_verify_mfa_login_totp():
    async def run():
        mock_db = MagicMock()
        mock_users = MagicMock()
        mock_sessions = MagicMock()
        mock_refresh_tokens = MagicMock()
        mock_login_activity = MagicMock()
        mock_audit_logs = MagicMock()

        mock_db.__getitem__.side_effect = lambda key: {
            "users": mock_users,
            "sessions": mock_sessions,
            "refresh_tokens": mock_refresh_tokens,
            "login_activity": mock_login_activity,
            "audit_logs": mock_audit_logs
        }.get(key, MagicMock())

        mock_users.find_one = AsyncMock()
        mock_sessions.insert_one = AsyncMock()
        mock_refresh_tokens.insert_one = AsyncMock()
        mock_login_activity.insert_one = AsyncMock()
        mock_audit_logs.insert_one = AsyncMock()

        secret = TOTPService.generate_secret()
        totp = pyotp.totp.TOTP(secret)
        current_code = totp.now()

        user_doc = {
            "_id": "60d5ec49f83a2c2b3c4d5e6f",
            "email": "mfa_totp@example.com",
            "mfa_totp_enabled": True,
            "totp_secret": secret,
            "role": "User",
            "plan_type": "free"
        }
        mock_users.find_one.return_value = user_doc

        # Test valid login
        res = await AuthService.verify_mfa_login(
            email="mfa_totp@example.com",
            otp=current_code,
            mfa_type="totp",
            db=mock_db
        )
        assert res["is_verified"] is True
        assert res["access_token"] is not None

        # Test invalid TOTP code
        with pytest.raises(HTTPException) as exc_info:
            await AuthService.verify_mfa_login(
                email="mfa_totp@example.com",
                otp="000000",
                mfa_type="totp",
                db=mock_db
            )
        assert exc_info.value.status_code == 401

    asyncio.run(run())

def test_verify_mfa_login_phone():
    async def run():
        mock_db = MagicMock()
        mock_users = MagicMock()
        mock_sessions = MagicMock()
        mock_refresh_tokens = MagicMock()
        mock_login_activity = MagicMock()
        mock_audit_logs = MagicMock()

        mock_db.__getitem__.side_effect = lambda key: {
            "users": mock_users,
            "sessions": mock_sessions,
            "refresh_tokens": mock_refresh_tokens,
            "login_activity": mock_login_activity,
            "audit_logs": mock_audit_logs
        }.get(key, MagicMock())

        mock_users.find_one = AsyncMock()
        mock_sessions.insert_one = AsyncMock()
        mock_refresh_tokens.insert_one = AsyncMock()
        mock_login_activity.insert_one = AsyncMock()
        mock_audit_logs.insert_one = AsyncMock()

        user_doc = {
            "_id": "60d5ec49f83a2c2b3c4d5e6f",
            "email": "mfa_phone@example.com",
            "mfa_phone_enabled": True,
            "phone": "+919876543210",
            "role": "User",
            "plan_type": "free"
        }
        mock_users.find_one.return_value = user_doc

        # Patch OTPService verification
        with patch("app.services.otp_service.OTPService.verify_otp", new_callable=AsyncMock) as mock_verify:
            mock_verify.return_value = True

            # Valid phone OTP login
            res = await AuthService.verify_mfa_login(
                email="mfa_phone@example.com",
                otp="123456",
                mfa_type="phone",
                db=mock_db
            )
            assert res["is_verified"] is True
            assert res["access_token"] is not None
            mock_verify.assert_called_once_with("+919876543210", "123456", purpose="mobile_verification", req=None)

            # Invalid phone OTP login
            mock_verify.return_value = False
            with pytest.raises(HTTPException) as exc_info:
                await AuthService.verify_mfa_login(
                    email="mfa_phone@example.com",
                    otp="000000",
                    mfa_type="phone",
                    db=mock_db
                )
            assert exc_info.value.status_code == 401

    asyncio.run(run())
