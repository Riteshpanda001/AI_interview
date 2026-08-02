import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from app.database import db_manager
from app.services.email_service import EmailService

def _ensure_utc(dt):
    if not dt:
        return None
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except Exception:
            return None
    if isinstance(dt, datetime):
        if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt
    return None

class OTPService:
    MAX_ATTEMPTS = 5
    OTP_EXPIRY_MINUTES = 1
    RESEND_COOLDOWN_SECONDS = 60

    @staticmethod
    def _generate_6digit_otp() -> str:
        return "".join(secrets.choice("0123456789") for _ in range(6))

    @staticmethod
    async def send_otp(email: str, purpose: str = "email_verification", user_name: str = "") -> str:
        clean_email = email.lower().strip()
        now = datetime.now(timezone.utc)
        db = db_manager.db

        # 1. Enforce 60-second resend cooldown check
        if db is not None:
            last_otp = await db["otps"].find_one({
                "email": clean_email,
                "purpose": purpose
            })
            if last_otp:
                created_at = _ensure_utc(last_otp.get("created_at"))
                if created_at and (now - created_at).total_seconds() < OTPService.RESEND_COOLDOWN_SECONDS:
                    wait_seconds = int(OTPService.RESEND_COOLDOWN_SECONDS - (now - created_at).total_seconds())
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Please wait {wait_seconds} seconds before requesting another code."
                    )
                # Invalidate existing previous OTP for this purpose
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})

        # 2. Generate 6-digit random OTP
        otp_code = OTPService._generate_6digit_otp()
        expires_at = now + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)

        # 3. Store in MongoDB 'otps' collection
        otp_record = {
            "email": clean_email,
            "otp": otp_code,
            "purpose": purpose,
            "expires_at": expires_at,
            "created_at": now,
            "attempts": 0
        }
        if db is not None:
            await db["otps"].insert_one(otp_record)

        # 4. Store in Redis cache with 5-minute TTL
        redis = db_manager.redis_client
        if redis:
            cache_key = f"otp:{purpose}:{clean_email}"
            await redis.set(cache_key, otp_code, ex=OTPService.OTP_EXPIRY_MINUTES * 60)

        # 5. Send branded HTML Email
        if purpose == "password_reset":
            subject = "🔑 Reset Your PreNova AI Password"
            html_content = EmailService.build_password_reset_email_html(user_name, otp_code)
        else:
            subject = "🔐 Verify Your Email – PreNova AI"
            html_content = EmailService.build_verification_email_html(user_name, otp_code)

        await EmailService.send_email(clean_email, subject, html_content)
        return otp_code

    @staticmethod
    async def resend_otp(email: str, purpose: str = "email_verification", user_name: str = "") -> str:
        return await OTPService.send_otp(email, purpose=purpose, user_name=user_name)

    @staticmethod
    async def verify_otp(email: str, otp: str, purpose: str = "email_verification") -> bool:
        clean_email = email.lower().strip()
        clean_otp = otp.strip()
        now = datetime.now(timezone.utc)
        db = db_manager.db

        # 2. Check in MongoDB 'otps' collection
        if db is not None:
            record = await db["otps"].find_one({
                "email": clean_email,
                "purpose": purpose
            })

            if not record:
                # Check Redis fallback
                redis = db_manager.redis_client
                if redis:
                    cached = await redis.get(f"otp:{purpose}:{clean_email}")
                    if cached == clean_otp:
                        await redis.delete(f"otp:{purpose}:{clean_email}")
                        return True
                return False

            # Check max attempts limit (5 attempts)
            attempts = record.get("attempts", 0) + 1
            if attempts > OTPService.MAX_ATTEMPTS:
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum OTP attempts exceeded. Please request a new verification code."
                )

            # Update attempt counter
            await db["otps"].update_one(
                {"_id": record["_id"]},
                {"$set": {"attempts": attempts}}
            )

            # Check expiration (5 minutes)
            expires_at = _ensure_utc(record.get("expires_at"))
            if expires_at and now > expires_at:
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Verification code has expired. Please request a new code."
                )

            # Validate OTP code match
            if record.get("otp") == clean_otp:
                # Valid OTP! Clean up record
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
                redis = db_manager.redis_client
                if redis:
                    await redis.delete(f"otp:{purpose}:{clean_email}")
                return True

        # Fallback to Redis if DB not available
        redis = db_manager.redis_client
        if redis:
            cached_otp = await redis.get(f"otp:{purpose}:{clean_email}")
            if cached_otp == clean_otp:
                await redis.delete(f"otp:{purpose}:{clean_email}")
                return True

        return False

    @staticmethod
    async def send_password_reset_otp(email: str, user_name: str = "") -> str:
        return await OTPService.send_otp(email, purpose="password_reset", user_name=user_name)

    @staticmethod
    async def verify_password_reset_otp(email: str, otp: str) -> bool:
        return await OTPService.verify_otp(email, otp, purpose="password_reset")
