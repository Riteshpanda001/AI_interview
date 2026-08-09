import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from app.config import settings
from app.database import db_manager
from app.services.email_service import EmailService
from app.services.audit_service import AuditLogService

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
    OTP_EXPIRY_MINUTES = 5
    RESEND_COOLDOWN_SECONDS = 60

    @staticmethod
    def _generate_6digit_otp() -> str:
        return "".join(secrets.choice("0123456789") for _ in range(6))

    @staticmethod
    def _hash_otp(otp_code: str, email: str, purpose: str) -> str:
        secret = settings.JWT_SECRET or "prenova-secret"
        raw = f"{secret}:{purpose}:{email.lower().strip()}:{otp_code.strip()}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    @staticmethod
    async def send_otp(email: str, purpose: str = "email_verification", user_name: str = "", req=None) -> str:
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

        # 2. Generate 6-digit random OTP and secure SHA-256 hash
        otp_code = OTPService._generate_6digit_otp()
        otp_hash = OTPService._hash_otp(otp_code, clean_email, purpose)
        expires_at = now + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)

        # 3. Store in MongoDB 'otps' collection (storing hash instead of plain text)
        otp_record = {
            "email": clean_email,
            "otp_hash": otp_hash,
            "purpose": purpose,
            "expires_at": expires_at,
            "created_at": now,
            "attempts": 0
        }
        if db is not None:
            await db["otps"].insert_one(otp_record)

        # 4. Store hash in Redis cache with 5-minute TTL
        redis = db_manager.redis_client
        if redis:
            cache_key = f"otp:{purpose}:{clean_email}"
            await redis.set(cache_key, otp_hash, ex=OTPService.OTP_EXPIRY_MINUTES * 60)

        # 5. Send branded HTML Email with unhashed OTP code
        if purpose == "password_reset":
            subject = "🔑 Reset Your PreNova AI Password"
            html_content = EmailService.build_password_reset_email_html(user_name, otp_code)
        elif purpose == "email_change":
            subject = "✉️ Confirm Your New Email Address – PreNova AI"
            html_content = EmailService.build_verification_email_html(user_name, otp_code)
        else:
            subject = "🔐 Verify Your Email – PreNova AI"
            html_content = EmailService.build_verification_email_html(user_name, otp_code)

        await EmailService.send_email(clean_email, subject, html_content)
        await AuditLogService.log_event(
            event_type="EVENT_OTP_GENERATED",
            email=clean_email,
            status="SUCCESS",
            details={"purpose": purpose},
            req=req,
            db=db
        )
        return otp_code

    @staticmethod
    async def resend_otp(email: str, purpose: str = "email_verification", user_name: str = "", req=None) -> str:
        return await OTPService.send_otp(email, purpose=purpose, user_name=user_name, req=req)

    @staticmethod
    async def verify_otp(email: str, otp: str, purpose: str = "email_verification", req=None) -> bool:
        clean_email = email.lower().strip()
        clean_otp = otp.strip()
        computed_hash = OTPService._hash_otp(clean_otp, clean_email, purpose)
        now = datetime.now(timezone.utc)
        db = db_manager.db

        # 1. Check in MongoDB 'otps' collection
        if db is not None:
            record = await db["otps"].find_one({
                "email": clean_email,
                "purpose": purpose
            })

            if not record:
                # Check Redis fallback
                redis = db_manager.redis_client
                if redis:
                    cached_hash = await redis.get(f"otp:{purpose}:{clean_email}")
                    if cached_hash in (computed_hash, clean_otp):
                        await redis.delete(f"otp:{purpose}:{clean_email}")
                        await AuditLogService.log_event("EVENT_OTP_VERIFIED", email=clean_email, status="SUCCESS", details={"purpose": purpose}, req=req, db=db)
                        return True
                await AuditLogService.log_event("EVENT_OTP_VERIFY_FAILED", email=clean_email, status="FAILED", details={"purpose": purpose, "reason": "No record found"}, req=req, db=db)
                return False

            # Check max attempts limit (5 attempts)
            attempts = record.get("attempts", 0) + 1
            if attempts > OTPService.MAX_ATTEMPTS:
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
                await AuditLogService.log_event("EVENT_OTP_MAX_ATTEMPTS_EXCEEDED", email=clean_email, status="BLOCKED", details={"purpose": purpose}, req=req, db=db)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum OTP attempts exceeded. Please request a new verification code."
                )

            # Update attempt counter
            await db["otps"].update_one(
                {"_id": record["_id"]},
                {"$set": {"attempts": attempts}}
            )

            # Check expiration
            expires_at = _ensure_utc(record.get("expires_at"))
            if expires_at and now > expires_at:
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
                await AuditLogService.log_event("EVENT_OTP_EXPIRED", email=clean_email, status="FAILED", details={"purpose": purpose}, req=req, db=db)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Verification code has expired. Please request a new code."
                )

            # Validate OTP hash (or plain text fallback for existing records/mock tests)
            is_match = (record.get("otp_hash") == computed_hash) or (record.get("otp") == clean_otp)
            if is_match:
                # Valid OTP! Clean up record
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
                redis = db_manager.redis_client
                if redis:
                    await redis.delete(f"otp:{purpose}:{clean_email}")
                await AuditLogService.log_event("EVENT_OTP_VERIFIED", email=clean_email, status="SUCCESS", details={"purpose": purpose}, req=req, db=db)
                return True

        # Fallback to Redis if DB not available
        redis = db_manager.redis_client
        if redis:
            cached_val = await redis.get(f"otp:{purpose}:{clean_email}")
            if cached_val in (computed_hash, clean_otp):
                await redis.delete(f"otp:{purpose}:{clean_email}")
                await AuditLogService.log_event("EVENT_OTP_VERIFIED", email=clean_email, status="SUCCESS", details={"purpose": purpose}, req=req, db=db)
                return True

        await AuditLogService.log_event("EVENT_OTP_VERIFY_FAILED", email=clean_email, status="FAILED", details={"purpose": purpose, "reason": "Hash mismatch"}, req=req, db=db)
        return False

    @staticmethod
    async def send_password_reset_otp(email: str, user_name: str = "", req=None) -> str:
        return await OTPService.send_otp(email, purpose="password_reset", user_name=user_name, req=req)

    @staticmethod
    async def verify_password_reset_otp(email: str, otp: str, req=None) -> bool:
        return await OTPService.verify_otp(email, otp, purpose="password_reset", req=req)

