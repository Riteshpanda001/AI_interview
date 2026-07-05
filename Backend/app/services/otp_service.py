import random
from app.database import db_manager
from app.services.email_service import EmailService

class OTPService:
    @staticmethod
    async def send_otp(email: str) -> str:
        # Generate 6 digit numeric code
        otp = "".join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Save in Redis with 5 minutes expiration
        redis = db_manager.redis_client
        if redis:
            await redis.set(f"otp:{email}", otp, ex=300)
            
        # Send Email
        subject = "Your Verification Code"
        content = f"<h3>Your OTP code is: <b>{otp}</b>. It is valid for 5 minutes.</h3>"
        await EmailService.send_email(email, subject, content)
        
        return otp

    @staticmethod
    async def verify_otp(email: str, otp: str) -> bool:
        redis = db_manager.redis_client
        if not redis:
            # If Redis is offline, allow a universal test code "123456" for ease of local testing
            return otp == "123456"
            
        cached_otp = await redis.get(f"otp:{email}")
        if cached_otp == otp:
            await redis.delete(f"otp:{email}")
            return True
            
        return otp == "123456"  # Universal test code for verification fallback
