import uuid
from typing import Any, Optional, Dict
from fastapi import HTTPException, status
import bcrypt
from app.schemas.auth_schema import UserRegisterRequest, UserLoginRequest, ChangePasswordRequest, RequestEmailChangeRequest, VerifyEmailChangeRequest
from app.schemas.user_schema import UserUpdateRequest
from app.services.jwt_service import JWTService
from app.services.otp_service import OTPService
from app.services.email_service import EmailService
from app.services.user_service import UserService
from app.services.google_auth import GoogleAuthService
from app.services.audit_service import AuditLogService
from app.constants import ERROR_INVALID_CREDENTIALS, ERROR_USER_NOT_FOUND, ROLE_USER, PLAN_FREE
from bson import ObjectId
from datetime import datetime, timezone, timedelta

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

def parse_device_info(user_agent: str) -> dict:
    if not user_agent:
        return {"device_type": "Desktop", "browser": "Browser", "os": "Windows", "formatted": "Web Browser on Windows (Desktop)"}
    ua = user_agent.lower()
    
    if "mobile" in ua or "android" in ua or "iphone" in ua:
        device_type = "Mobile"
    elif "tablet" in ua or "ipad" in ua:
        device_type = "Tablet"
    else:
        device_type = "Desktop"
        
    if "edg" in ua:
        browser = "Microsoft Edge"
    elif "chrome" in ua:
        browser = "Google Chrome"
    elif "firefox" in ua:
        browser = "Mozilla Firefox"
    elif "safari" in ua:
        browser = "Apple Safari"
    else:
        browser = "Web Browser"
        
    if "windows" in ua:
        os_name = "Windows"
    elif "mac" in ua:
        os_name = "macOS"
    elif "linux" in ua:
        os_name = "Linux"
    elif "android" in ua:
        os_name = "Android"
    elif "iphone" in ua or "ipad" in ua:
        os_name = "iOS"
    else:
        os_name = "Operating System"
        
    return {
        "device_type": device_type,
        "browser": browser,
        "os": os_name,
        "formatted": f"{browser} on {os_name} ({device_type})"
    }

class AuthService:
    MAX_FAILED_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 15

    @staticmethod
    def get_password_hash(password: str) -> str:
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        if not plain_password or not hashed_password:
            return False
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        try:
            return bcrypt.checkpw(pwd_bytes, hashed_bytes)
        except Exception:
            return False

    @staticmethod
    def validate_password_complexity(password: str) -> None:
        import re
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long."
            )
        if not re.search(r"[A-Z]", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter."
            )
        if not re.search(r"[a-z]", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one lowercase letter."
            )
        if not re.search(r"\d", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one number."
            )
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=]", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one special character."
            )

    @staticmethod
    async def register_user(request: UserRegisterRequest, db, req=None) -> dict:
        clean_email = request.email.lower().strip()
        clean_name = request.full_name.strip()

        if not clean_name or len(clean_name) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name must be at least 3 characters long."
            )

        if request.confirm_password and request.password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match."
            )

        AuthService.validate_password_complexity(request.password)

        existing_user = await UserService.find_by_email(clean_email, db)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address is already registered."
            )

        hashed_password = AuthService.get_password_hash(request.password)
        
        user_doc = await UserService.create_user(
            email=clean_email,
            full_name=clean_name,
            password_hash=hashed_password,
            provider="email",
            phone=request.phone,
            gender=request.gender,
            is_verified=False,
            db=db
        )
        
        await OTPService.send_otp(clean_email, purpose="email_verification", user_name=clean_name, req=req)
        await AuditLogService.log_event("EVENT_USER_REGISTERED", email=clean_email, user_id=str(user_doc.get("_id", "")), req=req, db=db)
        
        return {
            "success": True,
            "message": "Registration successful! A 6-digit verification code has been sent to your email."
        }

    @staticmethod
    async def record_login_event(email: str, status_code: str, provider: str, user_id: str = None, req = None, db = None):
        if db is None:
            return
        user_agent = req.headers.get("user-agent", "") if req else ""
        ip_address = req.client.host if req and req.client else "127.0.0.1"
        device_info = parse_device_info(user_agent)
        now = datetime.now(timezone.utc)

        activity_doc = {
            "user_id": str(user_id) if user_id else None,
            "email": email.lower().strip() if email else "",
            "status": status_code,
            "provider": provider,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "device": device_info["formatted"],
            "browser": device_info["browser"],
            "os": device_info["os"],
            "timestamp": now
        }
        try:
            await db["login_activity"].insert_one(activity_doc)
        except Exception as e:
            print(f"[AUTH SERVICE] Error logging activity: {e}")

    @staticmethod
    async def create_session(user_id: str, req = None, db = None) -> str:
        if db is None or not user_id:
            return "session_dev"
        user_agent = req.headers.get("user-agent", "") if req else ""
        ip_address = req.client.host if req and req.client else "127.0.0.1"
        device_info = parse_device_info(user_agent)
        now = datetime.now(timezone.utc)

        session_doc = {
            "user_id": str(user_id),
            "ip_address": ip_address,
            "user_agent": user_agent,
            "device": device_info["formatted"],
            "device_type": device_info["device_type"],
            "browser": device_info["browser"],
            "os": device_info["os"],
            "created_at": now,
            "last_active": now,
            "is_active": True
        }
        try:
            res = await db["sessions"].insert_one(session_doc)
            return str(res.inserted_id)
        except Exception as e:
            print(f"[AUTH SERVICE] Error creating session: {e}")
            return "session_dev"

    @staticmethod
    async def _issue_token_pair(user_id: str, session_id: str = None, db = None) -> dict:
        jti = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=7)

        access_token = JWTService.create_access_token({"sub": str(user_id)}, session_id=session_id)
        refresh_token = JWTService.create_refresh_token({"sub": str(user_id)}, session_id=session_id, jti=jti)

        if db is not None:
            await db["refresh_tokens"].insert_one({
                "jti": jti,
                "user_id": str(user_id),
                "session_id": str(session_id) if session_id else None,
                "created_at": now,
                "expires_at": expires_at,
                "is_revoked": False
            })

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "jti": jti
        }

    @staticmethod
    async def authenticate_user(email: str, password: str, db, req = None) -> dict:
        clean_email = email.lower().strip()
        user = await UserService.find_by_email(clean_email, db)
        now = datetime.now(timezone.utc)

        if not user:
            await AuthService.record_login_event(clean_email, "FAILED_CREDENTIALS", "email", req=req, db=db)
            await AuditLogService.log_event("EVENT_LOGIN_FAILED", email=clean_email, status="FAILED", details={"reason": "User not found"}, req=req, db=db)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_INVALID_CREDENTIALS
            )

        user_id_str = str(user["_id"])

        # 1. Account Lockout Check
        lockout_until = _ensure_utc(user.get("lockout_until"))
        if lockout_until and now < lockout_until:
            remaining_seconds = int((lockout_until - now).total_seconds())
            remaining_mins = max(1, remaining_seconds // 60)
            await AuditLogService.log_event("EVENT_LOGIN_BLOCKED_LOCKED", email=clean_email, user_id=user_id_str, status="BLOCKED", req=req, db=db)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account is temporarily locked due to multiple failed login attempts. Please try again in {remaining_mins} minutes."
            )

        if user.get("provider") == "google" and not user.get("hashed_password"):
            await AuthService.record_login_event(clean_email, "FAILED_GOOGLE_ACCOUNT", "email", user_id=user_id_str, req=req, db=db)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account was registered via Google Sign-In. Please click 'Continue with Google'."
            )

        # 2. Password Verification
        if not AuthService.verify_password(password, user.get("hashed_password", "")):
            failed_attempts = user.get("failed_login_attempts", 0) + 1
            update_fields = {"failed_login_attempts": failed_attempts}

            if failed_attempts >= AuthService.MAX_FAILED_LOGIN_ATTEMPTS:
                new_lockout = now + timedelta(minutes=AuthService.LOCKOUT_DURATION_MINUTES)
                update_fields["lockout_until"] = new_lockout
                await AuditLogService.log_event("EVENT_ACCOUNT_LOCKED", email=clean_email, user_id=user_id_str, status="LOCKED", details={"failed_attempts": failed_attempts}, req=req, db=db)
            else:
                await AuditLogService.log_event("EVENT_LOGIN_FAILED", email=clean_email, user_id=user_id_str, status="FAILED", details={"failed_attempts": failed_attempts}, req=req, db=db)

            if db is not None:
                await db["users"].update_one({"_id": user["_id"]}, {"$set": update_fields})

            await AuthService.record_login_event(clean_email, "FAILED_CREDENTIALS", "email", user_id=user_id_str, req=req, db=db)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_INVALID_CREDENTIALS
            )

        # Reset failed attempts counter on successful login
        if user.get("failed_login_attempts", 0) > 0 or user.get("lockout_until") is not None:
            if db is not None:
                await db["users"].update_one({"_id": user["_id"]}, {"$set": {"failed_login_attempts": 0, "lockout_until": None}})

        # Check if user is verified
        is_verified = user.get("is_verified", False) or user.get("is_active", False)
        if not is_verified:
            await AuthService.record_login_event(clean_email, "UNVERIFIED_EMAIL", "email", user_id=user_id_str, req=req, db=db)
            try:
                await OTPService.send_otp(clean_email, purpose="email_verification", user_name=user.get("full_name", ""), req=req)
            except HTTPException:
                pass

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before logging in."
            )

        # Check if MFA is required
        mfa_totp_enabled = user.get("mfa_totp_enabled", False)
        mfa_phone_enabled = user.get("mfa_phone_enabled", False)

        if mfa_totp_enabled or mfa_phone_enabled:
            mfa_type = "totp" if mfa_totp_enabled else "phone"
            if mfa_phone_enabled and user.get("phone"):
                # Automatically send SMS OTP
                try:
                    await OTPService.send_mobile_otp(user.get("phone"), user_id=user_id_str, req=req)
                except Exception as e:
                    print(f"[AUTH SERVICE] Error sending Phone OTP for MFA login: {e}")

            await AuditLogService.log_event("EVENT_MFA_CHALLENGE", email=clean_email, user_id=user_id_str, status="SUCCESS", details={"mfa_type": mfa_type}, req=req, db=db)

            return {
                "access_token": None,
                "refresh_token": None,
                "token_type": "bearer",
                "role": user.get("role", ROLE_USER),
                "plan_type": user.get("plan_type", PLAN_FREE),
                "require_otp": True,
                "is_verified": True,
                "email": clean_email,
                "message": "Authenticator code required" if mfa_totp_enabled else "SMS verification code sent to your registered phone"
            }

        session_id = await AuthService.create_session(user_id_str, req=req, db=db)
        tokens = await AuthService._issue_token_pair(user_id_str, session_id=session_id, db=db)

        await AuthService.record_login_event(clean_email, "SUCCESS", "email", user_id=user_id_str, req=req, db=db)
        await AuditLogService.log_event("EVENT_LOGIN_SUCCESS", email=clean_email, user_id=user_id_str, status="SUCCESS", req=req, db=db)

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE),
            "is_verified": True
        }

    @staticmethod
    async def google_login(id_token: str, db, req = None) -> dict:
        google_profile = await GoogleAuthService.verify_google_token(id_token)
        google_id = google_profile.get("google_id")
        email = google_profile.get("email")
        name = google_profile.get("name")
        picture = google_profile.get("picture")

        user = await UserService.find_by_google_id(google_id, db)
        if not user:
            user = await UserService.find_by_email(email, db)

        if user:
            existing_prov = user.get("auth_provider", "local" if user.get("provider") == "email" else "google")
            new_prov = "local+google" if "local" in existing_prov and existing_prov != "google" else existing_prov
            
            update_data = {
                "is_verified": True,
                "is_active": True,
                "auth_provider": new_prov,
                "google_id": google_id,
                "google_email": email,
                "google_verified": True,
                "failed_login_attempts": 0,
                "lockout_until": None,
                "updated_at": datetime.now(timezone.utc)
            }
            if picture and not user.get("profile_picture"):
                update_data["profile_picture"] = picture
                update_data["avatar_url"] = picture

            await db["users"].update_one(
                {"_id": user["_id"]},
                {"$set": update_data}
            )
            user = await db["users"].find_one({"_id": user["_id"]})
        else:
            user = await UserService.create_user(
                email=email,
                full_name=name,
                provider="google",
                google_id=google_id,
                profile_picture=picture,
                is_verified=True,
                db=db
            )

        user_id_str = str(user["_id"])
        session_id = await AuthService.create_session(user_id_str, req=req, db=db)
        tokens = await AuthService._issue_token_pair(user_id_str, session_id=session_id, db=db)

        await AuthService.record_login_event(email, "SUCCESS", "google", user_id=user_id_str, req=req, db=db)
        await AuditLogService.log_event("EVENT_GOOGLE_LOGIN_SUCCESS", email=email, user_id=user_id_str, status="SUCCESS", req=req, db=db)

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE),
            "is_verified": True
        }

    @staticmethod
    async def resend_user_otp(email: str, purpose: str = "email_verification", db: Any = None, req = None) -> dict:
        clean_email = email.lower().strip()
        user = await UserService.find_by_email(clean_email, db)
        user_name = user.get("full_name", "") if user else ""

        await OTPService.resend_otp(clean_email, purpose=purpose, user_name=user_name, req=req)
        return {"success": True, "message": f"Verification code re-sent to {clean_email}"}

    @staticmethod
    async def verify_user_otp(email: str, otp: str, purpose: str = "email_verification", db: Any = None, req = None) -> dict:
        clean_email = email.lower().strip()
        is_valid = await OTPService.verify_otp(clean_email, otp, purpose=purpose, req=req)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code."
            )
            
        user = await UserService.find_by_email(clean_email, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found. Please register again."
            )
            
        await UserService.mark_user_verified(clean_email, db)
        user = await UserService.find_by_email(clean_email, db)
        user_id_str = str(user["_id"])

        session_id = await AuthService.create_session(user_id_str, req=req, db=db)
        tokens = await AuthService._issue_token_pair(user_id_str, session_id=session_id, db=db)

        await AuditLogService.log_event("EVENT_USER_VERIFIED", email=clean_email, user_id=user_id_str, status="SUCCESS", req=req, db=db)
        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE),
            "is_verified": True
        }

    @staticmethod
    async def refresh_token(refresh_token_str: str, db, req = None) -> dict:
        payload = JWTService.decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )
            
        user_id = payload.get("sub")
        jti = payload.get("jti")
        session_id = payload.get("session_id")

        user = await UserService.find_by_id(user_id, db)
        if not user or not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account inactive or not found."
            )

        now = datetime.now(timezone.utc)

        # Refresh Token Rotation & Theft Reuse Detection
        if db is not None and jti:
            token_record = await db["refresh_tokens"].find_one({"jti": jti})
            if token_record and token_record.get("is_revoked"):
                # TOKEN REUSE DETECTED! Revoke ALL user refresh tokens and sessions immediately!
                await db["refresh_tokens"].update_many({"user_id": str(user_id)}, {"$set": {"is_revoked": True, "revoked_at": now}})
                await db["sessions"].update_many({"user_id": str(user_id)}, {"$set": {"is_active": False}})
                await AuditLogService.log_event("EVENT_TOKEN_REUSE_DETECTED", user_id=str(user_id), email=user.get("email"), status="ALERT", details={"compromised_jti": jti}, req=req, db=db)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Security alert: Token reuse detected. All sessions have been revoked for your safety."
                )

            # Invalidate old refresh token (rotate)
            if token_record:
                await db["refresh_tokens"].update_one({"jti": jti}, {"$set": {"is_revoked": True, "revoked_at": now}})

        user_id_val = str(user.get("_id") or user.get("id") or user_id)
        tokens = await AuthService._issue_token_pair(user_id_val, session_id=session_id, db=db)
        await AuditLogService.log_event("EVENT_TOKEN_REFRESHED", user_id=user_id_val, email=user.get("email"), status="SUCCESS", req=req, db=db)

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE),
            "is_verified": True
        }

    @staticmethod
    async def logout_user(token_str: str, db, req = None) -> dict:
        from app.database import db_manager
        redis = db_manager.redis_client
        if redis and token_str:
            await redis.set(f"blacklist:{token_str}", "1", ex=86400)

        payload = JWTService.decode_token(token_str)
        user_id = payload.get("sub") if payload else None
        jti = payload.get("jti") if payload else None
        if db is not None and jti:
            await db["refresh_tokens"].update_one({"jti": jti}, {"$set": {"is_revoked": True, "revoked_at": datetime.now(timezone.utc)}})

        await AuditLogService.log_event("EVENT_LOGOUT", user_id=user_id, status="SUCCESS", req=req, db=db)
        return {"success": True, "message": "Successfully logged out"}

    @staticmethod
    async def forgot_password(email: str, db, req = None) -> dict:
        clean_email = email.lower().strip()
        user = await UserService.find_by_email(clean_email, db)
        if not user:
            # Safe generic response to prevent account enumeration
            return {"success": True, "message": "If an account exists with this email address, a password recovery code has been sent."}

        await OTPService.send_password_reset_otp(clean_email, user_name=user.get("full_name", ""), req=req)
        await AuditLogService.log_event("EVENT_FORGOT_PASSWORD_REQUESTED", email=clean_email, user_id=str(user["_id"]), status="SUCCESS", req=req, db=db)
        return {"success": True, "message": "Password recovery code sent to your email."}

    @staticmethod
    async def reset_password(
        email: str,
        new_password: str,
        reset_token: str = None,
        otp: str = None,
        confirm_password: str = None,
        db: Any = None,
        req = None
    ) -> dict:
        if confirm_password and new_password != confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match."
            )

        if len(new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long."
            )

        clean_email = email.lower().strip()
        now = datetime.now(timezone.utc)

        # 1. Validate Single-Use Reset Token or Direct OTP Verification
        if reset_token:
            if db is not None:
                token_record = await db["password_reset_tokens"].find_one({
                    "reset_token": reset_token,
                    "email": clean_email,
                    "used": False
                })
                if not token_record:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid or already used password reset token. Please request a new password reset."
                    )
                exp = _ensure_utc(token_record.get("expires_at"))
                if exp and now > exp:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Password reset session expired. Please request a new verification code."
                    )

                token_filter = {"_id": token_record["_id"]} if "_id" in token_record else {"reset_token": reset_token}
                await db["password_reset_tokens"].update_one(
                    token_filter,
                    {"$set": {"used": True, "used_at": now}}
                )
        elif otp:
            is_valid = await OTPService.verify_otp(clean_email, otp, purpose="password_reset", req=req)
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired password recovery code."
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code or password reset token is required."
            )

        user = await UserService.find_by_email(clean_email, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_USER_NOT_FOUND
            )

        hashed_password = AuthService.get_password_hash(new_password)
        user_filter = {"_id": user["_id"]} if isinstance(user, dict) and "_id" in user else {"email": clean_email}
        if db is not None:
            await db["users"].update_one(
                user_filter,
                {"$set": {
                    "hashed_password": hashed_password,
                    "password": hashed_password,
                    "is_verified": True,
                    "is_active": True,
                    "failed_login_attempts": 0,
                    "lockout_until": None,
                    "updated_at": now
                }}
            )
            user_id_str = str(user.get("_id") or user.get("id") or "")
            await db["sessions"].update_many({"user_id": user_id_str}, {"$set": {"is_active": False}})
            await db["refresh_tokens"].update_many({"user_id": user_id_str}, {"$set": {"is_revoked": True, "revoked_at": now}})

        user_id_str = str(user.get("_id") or user.get("id") or "")
        await AuditLogService.log_event("EVENT_PASSWORD_RESET_SUCCESS", email=clean_email, user_id=user_id_str, status="SUCCESS", req=req, db=db)
        return {"success": True, "message": "Password reset successfully. You can now login with your new credentials."}

    @staticmethod
    async def change_password(user_id: str, request: ChangePasswordRequest, db, req = None) -> dict:
        if request.confirm_password and request.new_password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password and confirmation password do not match."
            )

        if len(request.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters long."
            )

        user = await UserService.find_by_id(user_id, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_USER_NOT_FOUND
            )

        if not AuthService.verify_password(request.old_password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password."
            )

        hashed_password = AuthService.get_password_hash(request.new_password)
        try:
            query = {"_id": ObjectId(user_id)}
        except Exception:
            query = {"_id": user_id}

        await db["users"].update_one(
            query,
            {"$set": {
                "hashed_password": hashed_password,
                "failed_login_attempts": 0,
                "lockout_until": None,
                "updated_at": datetime.now(timezone.utc)
            }}
        )

        await AuditLogService.log_event("EVENT_PASSWORD_CHANGED", user_id=str(user_id), email=user.get("email"), status="SUCCESS", req=req, db=db)
        return {"success": True, "message": "Password changed successfully."}

    @staticmethod
    async def request_email_change(user_id: str, request: RequestEmailChangeRequest, db, req = None) -> dict:
        user = await UserService.find_by_id(user_id, db)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ERROR_USER_NOT_FOUND)

        if user.get("provider") == "email" and user.get("hashed_password"):
            if not AuthService.verify_password(request.password, user.get("hashed_password", "")):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password.")

        new_email_clean = request.new_email.lower().strip()
        existing = await UserService.find_by_email(new_email_clean, db)
        if existing and str(existing["_id"]) != str(user_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This email address is already in use.")

        await OTPService.send_otp(new_email_clean, purpose="email_change", user_name=user.get("full_name", ""), req=req)
        await AuditLogService.log_event("EVENT_EMAIL_CHANGE_REQUESTED", user_id=str(user_id), email=new_email_clean, status="SUCCESS", req=req, db=db)

        return {"success": True, "message": f"Verification code sent to new email: {new_email_clean}"}

    @staticmethod
    async def verify_email_change(user_id: str, request: VerifyEmailChangeRequest, db, req = None) -> dict:
        new_email_clean = request.new_email.lower().strip()
        is_valid = await OTPService.verify_otp(new_email_clean, request.otp, purpose="email_change", req=req)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification code.")

        user = await UserService.find_by_id(user_id, db)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ERROR_USER_NOT_FOUND)

        try:
            query = {"_id": ObjectId(user_id)}
        except Exception:
            query = {"_id": user_id}

        await db["users"].update_one(
            query,
            {"$set": {
                "email": new_email_clean,
                "is_verified": True,
                "updated_at": datetime.now(timezone.utc)
            }}
        )

        await AuditLogService.log_event("EVENT_EMAIL_CHANGED", user_id=str(user_id), email=new_email_clean, status="SUCCESS", req=req, db=db)
        return {"success": True, "message": "Email address updated successfully."}

    @staticmethod
    async def update_user_profile(user_id: str, request: UserUpdateRequest, db) -> dict:
        update_data = {}
        if request.full_name is not None:
            update_data["full_name"] = request.full_name
        if request.target_role is not None:
            update_data["target_role"] = request.target_role
        if request.experience_level is not None:
            update_data["experience_level"] = request.experience_level
        if request.bio is not None:
            update_data["bio"] = request.bio
        if request.avatar_url is not None:
            update_data["avatar_url"] = request.avatar_url
            update_data["profile_picture"] = request.avatar_url
        if request.profile_picture is not None:
            update_data["profile_picture"] = request.profile_picture
            update_data["avatar_url"] = request.profile_picture
            
        if not update_data:
            user = await UserService.find_by_id(user_id, db)
            if user:
                user["id"] = str(user["_id"])
            return user
            
        update_data["updated_at"] = datetime.now(timezone.utc)
        try:
            query = {"_id": ObjectId(user_id)}
        except Exception:
            query = {"_id": user_id}

        await db["users"].update_one(
            query,
            {"$set": update_data}
        )
        
        user = await UserService.find_by_id(user_id, db)
        if user:
            user["id"] = str(user["_id"])
        return user

    @staticmethod
    async def get_user_sessions(user_id: str, db = None) -> list:
        if db is None:
            return []
        cursor = db["sessions"].find({"user_id": str(user_id), "is_active": True}).sort("last_active", -1)
        sessions = await cursor.to_list(length=20)
        formatted = []
        for i, s in enumerate(sessions):
            formatted.append({
                "id": str(s["_id"]),
                "device": s.get("device", "Web Browser"),
                "device_type": s.get("device_type", "Desktop"),
                "browser": s.get("browser", "Browser"),
                "os": s.get("os", "OS"),
                "ip_address": s.get("ip_address", "127.0.0.1"),
                "last_active": s.get("last_active", s.get("created_at")),
                "is_current": i == 0
            })
        if not formatted:
            formatted.append({
                "id": "current_session_1",
                "device": "Google Chrome on Windows (Desktop)",
                "device_type": "Desktop",
                "browser": "Google Chrome",
                "os": "Windows",
                "ip_address": "127.0.0.1",
                "last_active": datetime.now(timezone.utc).isoformat(),
                "is_current": True
            })
        return formatted

    @staticmethod
    async def revoke_session(user_id: str, session_id: str, db = None, req = None) -> dict:
        if db is None:
            return {"success": True, "message": "Session revoked."}
        try:
            await db["sessions"].update_one(
                {"_id": ObjectId(session_id), "user_id": str(user_id)},
                {"$set": {"is_active": False}}
            )
            await db["refresh_tokens"].update_many(
                {"session_id": str(session_id), "user_id": str(user_id)},
                {"$set": {"is_revoked": True, "revoked_at": datetime.now(timezone.utc)}}
            )
            await AuditLogService.log_event("EVENT_SESSION_REVOKED", user_id=str(user_id), status="SUCCESS", details={"session_id": session_id}, req=req, db=db)
        except Exception:
            pass
        return {"success": True, "message": "Session revoked successfully."}

    @staticmethod
    async def revoke_other_sessions(user_id: str, db = None, req = None) -> dict:
        if db is None:
            return {"success": True, "message": "All other sessions revoked."}
        try:
            await db["sessions"].update_many(
                {"user_id": str(user_id)},
                {"$set": {"is_active": False}}
            )
            await db["refresh_tokens"].update_many(
                {"user_id": str(user_id)},
                {"$set": {"is_revoked": True, "revoked_at": datetime.now(timezone.utc)}}
            )
            await AuditLogService.log_event("EVENT_OTHER_SESSIONS_REVOKED", user_id=str(user_id), status="SUCCESS", req=req, db=db)
        except Exception as e:
            print(f"[AUTH SERVICE] Error revoking other sessions: {e}")
        return {"success": True, "message": "All other sessions have been revoked."}

    @staticmethod
    async def get_login_activity(user_id: str, email: str, db = None) -> list:
        if db is None:
            return []
        query = {"$or": [{"user_id": str(user_id)}, {"email": email.lower().strip()}]}
        cursor = db["login_activity"].find(query).sort("timestamp", -1).limit(15)
        activities = await cursor.to_list(length=15)
        formatted = []
        for act in activities:
            formatted.append({
                "id": str(act["_id"]),
                "status": act.get("status", "SUCCESS"),
                "provider": act.get("provider", "email"),
                "ip_address": act.get("ip_address", "127.0.0.1"),
                "device": act.get("device", "Desktop Browser"),
                "timestamp": act.get("timestamp")
            })
        return formatted

    @staticmethod
    async def delete_user_account(user_id: str, password: str = None, db = None, req = None) -> dict:
        user = await UserService.find_by_id(user_id, db)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=ERROR_USER_NOT_FOUND)

        if user.get("provider") == "email" and user.get("hashed_password"):
            if not password:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password is required to delete your account.")
            if not AuthService.verify_password(password, user.get("hashed_password")):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password. Account deletion cancelled.")

        try:
            u_id_str = str(user["_id"])
            try:
                u_obj_id = ObjectId(u_id_str)
            except Exception:
                u_obj_id = u_id_str

            await db["users"].delete_one({"_id": u_obj_id})
            await db["resumes"].delete_many({"user_id": u_id_str})
            await db["interviews"].delete_many({"user_id": u_id_str})
            await db["sessions"].delete_many({"user_id": u_id_str})
            await db["refresh_tokens"].delete_many({"user_id": u_id_str})
            await db["login_activity"].delete_many({"user_id": u_id_str})
            await AuditLogService.log_event("EVENT_USER_ACCOUNT_DELETED", user_id=u_id_str, email=user.get("email"), status="SUCCESS", req=req, db=db)
        except Exception as exc:
            print(f"[AUTH SERVICE] Error deleting user account data: {exc}")

        return {"success": True, "message": "Your account and all associated data have been permanently deleted."}

    @staticmethod
    async def verify_mfa_login(email: str, otp: str, mfa_type: str, db, req = None) -> dict:
        from app.services.totp_service import TOTPService
        from app.services.otp_service import OTPService
        
        clean_email = email.lower().strip()
        user = await UserService.find_by_email(clean_email, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_USER_NOT_FOUND
            )
            
        user_id_str = str(user["_id"])
        
        if mfa_type == "totp":
            totp_secret = user.get("totp_secret")
            if not totp_secret:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="TOTP is not configured for this user."
                )
            is_valid = TOTPService.verify_code(totp_secret, otp)
            if not is_valid:
                await AuditLogService.log_event("EVENT_MFA_TOTP_FAILED", email=clean_email, user_id=user_id_str, status="FAILED", req=req, db=db)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authenticator code."
                )
        elif mfa_type == "phone":
            phone = user.get("phone")
            if not phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No phone number linked to this account."
                )
            is_valid = await OTPService.verify_otp(phone, otp, purpose="mobile_verification", req=req)
            if not is_valid:
                await AuditLogService.log_event("EVENT_MFA_PHONE_FAILED", email=clean_email, user_id=user_id_str, status="FAILED", req=req, db=db)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired SMS verification code."
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid MFA type."
            )
            
        # MFA verification succeeded - issue tokens!
        session_id = await AuthService.create_session(user_id_str, req=req, db=db)
        tokens = await AuthService._issue_token_pair(user_id_str, session_id=session_id, db=db)

        await AuthService.record_login_event(clean_email, "SUCCESS", "email_mfa", user_id=user_id_str, req=req, db=db)
        await AuditLogService.log_event("EVENT_LOGIN_SUCCESS_MFA", email=clean_email, user_id=user_id_str, status="SUCCESS", details={"mfa_type": mfa_type}, req=req, db=db)

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE),
            "is_verified": True
        }
