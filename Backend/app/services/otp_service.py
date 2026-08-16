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
    OTP_EXPIRY_MINUTES = 10
    RESEND_COOLDOWN_SECONDS = 60

    @staticmethod
    def _generate_6digit_otp() -> str:
        return str(secrets.randbelow(900000) + 100000)

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

        email_sent = await EmailService.send_email(clean_email, subject, html_content)
        if not email_sent:
            # Clean up un-delivered record
            if db is not None:
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email delivery service is currently unavailable. Please try again in a few moments."
            )

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

        if db is not None:
            record = await db["otps"].find_one({
                "email": clean_email,
                "purpose": purpose
            })

            if not record:
                redis = db_manager.redis_client
                if redis:
                    cached_hash = await redis.get(f"otp:{purpose}:{clean_email}")
                    if cached_hash in (computed_hash, clean_otp):
                        await redis.delete(f"otp:{purpose}:{clean_email}")
                        await AuditLogService.log_event("EVENT_OTP_VERIFIED", email=clean_email, status="SUCCESS", details={"purpose": purpose}, req=req, db=db)
                        return True
                await AuditLogService.log_event("EVENT_OTP_VERIFY_FAILED", email=clean_email, status="FAILED", details={"purpose": purpose, "reason": "No record found"}, req=req, db=db)
                return False

            attempts = record.get("attempts", 0) + 1
            if attempts > OTPService.MAX_ATTEMPTS:
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
                await AuditLogService.log_event("EVENT_OTP_MAX_ATTEMPTS_EXCEEDED", email=clean_email, status="BLOCKED", details={"purpose": purpose}, req=req, db=db)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum OTP attempts exceeded. Please request a new verification code."
                )

            await db["otps"].update_one(
                {"_id": record["_id"]},
                {"$set": {"attempts": attempts}}
            )

            expires_at = _ensure_utc(record.get("expires_at"))
            if expires_at and now > expires_at:
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
                await AuditLogService.log_event("EVENT_OTP_EXPIRED", email=clean_email, status="FAILED", details={"purpose": purpose}, req=req, db=db)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Verification code has expired. Please request a new code."
                )

            is_match = (record.get("otp_hash") == computed_hash) or (record.get("otp") == clean_otp)
            if is_match:
                await db["otps"].delete_many({"email": clean_email, "purpose": purpose})
                redis = db_manager.redis_client
                if redis:
                    await redis.delete(f"otp:{purpose}:{clean_email}")
                await AuditLogService.log_event("EVENT_OTP_VERIFIED", email=clean_email, status="SUCCESS", details={"purpose": purpose}, req=req, db=db)
                return True

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
    async def verify_password_reset_otp(email: str, otp: str, req=None) -> dict:
        import uuid
        clean_email = email.lower().strip()
        is_valid = await OTPService.verify_otp(clean_email, otp, purpose="password_reset", req=req)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password recovery code."
            )

        db = db_manager.db
        reset_token = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=10)

        if db is not None:
            await db["password_reset_tokens"].delete_many({"email": clean_email})
            await db["password_reset_tokens"].insert_one({
                "reset_token": reset_token,
                "email": clean_email,
                "created_at": now,
                "expires_at": expires_at,
                "used": False
            })

        return {
            "valid": True,
            "reset_token": reset_token,
            "message": "OTP verified successfully. You may now set your new password."
        }

    @staticmethod
    async def send_mobile_otp(phone: str, user_id: str = None, req=None) -> str:
        from app.services.sms_service import SMSService, normalize_phone_number
        clean_phone = normalize_phone_number(phone)
        if not clean_phone or len(clean_phone) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format. Please specify a valid mobile number."
            )

        now = datetime.now(timezone.utc)
        db = db_manager.db
        purpose = "mobile_verification"

        if db is not None:
            last_otp = await db["otps"].find_one({"email": clean_phone, "purpose": purpose})
            if last_otp:
                created_at = _ensure_utc(last_otp.get("created_at"))
                if created_at and (now - created_at).total_seconds() < OTPService.RESEND_COOLDOWN_SECONDS:
                    wait_seconds = int(OTPService.RESEND_COOLDOWN_SECONDS - (now - created_at).total_seconds())
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Please wait {wait_seconds} seconds before requesting another SMS code."
                    )
                await db["otps"].delete_many({"email": clean_phone, "purpose": purpose})

        otp_code = OTPService._generate_6digit_otp()
        otp_hash = OTPService._hash_otp(otp_code, clean_phone, purpose)
        expires_at = now + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)

        otp_record = {
            "email": clean_phone,
            "user_id": str(user_id) if user_id else None,
            "otp_hash": otp_hash,
            "purpose": purpose,
            "expires_at": expires_at,
            "created_at": now,
            "attempts": 0
        }
        if db is not None:
            await db["otps"].insert_one(otp_record)

        sms_sent = await SMSService.send_otp_sms(clean_phone, otp_code)
        if not sms_sent:
            if db is not None:
                await db["otps"].delete_many({"email": clean_phone, "purpose": purpose})
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="SMS gateway delivery failed. Please check the mobile number and try again."
            )

        return otp_code

    @staticmethod
    async def verify_mobile_otp(phone: str, otp: str, user_id: str = None, req=None) -> dict:
        from app.services.sms_service import normalize_phone_number
        from bson import ObjectId
        clean_phone = normalize_phone_number(phone)
        is_valid = await OTPService.verify_otp(clean_phone, otp, purpose="mobile_verification", req=req)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired SMS verification code."
            )

        db = db_manager.db
        now = datetime.now(timezone.utc)

        if db is not None and user_id:
            try:
                query = {"_id": ObjectId(user_id)}
            except Exception:
                query = {"_id": user_id}

            await db["users"].update_one(
                query,
                {"$set": {
                    "phone": clean_phone,
                    "phone_verified": True,
                    "phone_verified_at": now,
                    "updated_at": now
                }}
            )

        return {
            "success": True,
            "phone_verified": True,
            "message": "Mobile number verified successfully!"
        }


