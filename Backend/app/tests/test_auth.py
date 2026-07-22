import pytest
from app.services.auth_service import AuthService
from app.schemas.auth_schema import UserRegisterRequest

def test_password_hashing():
    password = "securepassword123"
    hashed = AuthService.get_password_hash(password)
    assert hashed != password
    assert AuthService.verify_password(password, hashed)
    assert not AuthService.verify_password("wrong_password", hashed)


def test_register_and_verify_otp_flow():
    import asyncio
    from unittest.mock import AsyncMock, patch, MagicMock

    async def run_test():
        # Mock DB
        mock_db = {}
        users_collection = MagicMock()
        users_collection.find_one = AsyncMock(return_value=None)
        users_collection.insert_one = AsyncMock(return_value=MagicMock(inserted_id="507f1f77bcf86cd799439011"))
        users_collection.update_one = AsyncMock(return_value=None)
        mock_db["users"] = users_collection

        # Patch OTPService and EmailService
        with patch("app.services.otp_service.OTPService.send_otp", new_callable=AsyncMock) as mock_send_otp, \
             patch("app.services.otp_service.OTPService.verify_otp", new_callable=AsyncMock) as mock_verify_otp, \
             patch("app.services.email_service.EmailService.send_email", new_callable=AsyncMock) as mock_send_email:

            mock_send_otp.return_value = "123456"
            mock_verify_otp.return_value = True

            # 1. Register user
            request = UserRegisterRequest(
                email="newuser@example.com",
                password="SecurePassword123!",
                full_name="New User"
            )

            reg_res = await AuthService.register_user(request, mock_db)
            assert reg_res["success"] is True
            assert "Registration successful" in reg_res["message"]
            mock_send_otp.assert_called_once_with("newuser@example.com", purpose="email_verification", user_name="New User")

            # 2. Verify OTP
            users_collection.find_one = AsyncMock(return_value={
                "_id": "507f1f77bcf86cd799439011",
                "email": "newuser@example.com",
                "full_name": "New User",
                "role": "User",
                "plan_type": "free"
            })

            token_res = await AuthService.verify_user_otp("newuser@example.com", "123456", db=mock_db)
            assert "access_token" in token_res
            assert "refresh_token" in token_res
            mock_verify_otp.assert_called_once_with("newuser@example.com", "123456", purpose="email_verification")

    asyncio.run(run_test())

def test_mock_redis_functionality():
    import asyncio
    from app.database import MockRedis

    async def run_test():
        redis = MockRedis()
        
        # Test set & get & ttl
        await redis.set("otp:user@example.com", "987654", ex=300)
        val = await redis.get("otp:user@example.com")
        assert val == "987654"
        ttl = await redis.ttl("otp:user@example.com")
        assert 295 <= ttl <= 300

        # Test pipeline & incr
        async with redis.pipeline() as pipe:
            await pipe.incr("rate_limit:ip:123").expire("rate_limit:ip:123", 60).execute()

        count = await redis.get("rate_limit:ip:123")
        assert count == "1"

        # Test delete
        await redis.delete("otp:user@example.com")
        assert await redis.get("otp:user@example.com") is None
        assert await redis.ttl("otp:user@example.com") == -2

    asyncio.run(run_test())


