from fastapi import HTTPException, status
import bcrypt
from app.schemas.auth_schema import UserRegisterRequest, UserLoginRequest, ChangePasswordRequest
from app.schemas.user_schema import UserUpdateRequest
from app.services.jwt_service import JWTService
from app.services.otp_service import OTPService
from app.services.email_service import EmailService
from app.services.user_service import UserService
from app.services.google_auth import GoogleAuthService
from app.constants import ERROR_INVALID_CREDENTIALS, ERROR_USER_NOT_FOUND, ROLE_USER, PLAN_FREE
from bson import ObjectId
from datetime import datetime

class AuthService:
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
    async def register_user(request: UserRegisterRequest, db) -> dict:
        clean_email = request.email.lower().strip()
        clean_name = request.full_name.strip()

        if not clean_name or len(clean_name) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name must be at least 3 characters long."
            )

        # Check confirm password if provided
        if request.confirm_password and request.password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match."
            )

        AuthService.validate_password_complexity(request.password)

        # Check if user already exists
        existing_user = await UserService.find_by_email(clean_email, db)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address is already registered."
            )

        hashed_password = AuthService.get_password_hash(request.password)
        
        # Create unverified user
        await UserService.create_user(
            email=clean_email,
            full_name=clean_name,
            password_hash=hashed_password,
            provider="email",
            is_verified=False,
            db=db
        )
        
        # Send 6-digit OTP to user's email
        await OTPService.send_otp(clean_email, purpose="email_verification", user_name=clean_name)
        
        return {
            "success": True,
            "message": "Registration successful! A 6-digit verification code has been sent to your email."
        }

    @staticmethod
    async def authenticate_user(email: str, password: str, db) -> dict:
        clean_email = email.lower().strip()
        user = await UserService.find_by_email(clean_email, db)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_INVALID_CREDENTIALS
            )

        if user.get("provider") == "google" and not user.get("hashed_password"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account was registered via Google Sign-In. Please click 'Continue with Google'."
            )

        if not AuthService.verify_password(password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_INVALID_CREDENTIALS
            )

        # Check if user is verified
        is_verified = user.get("is_verified", False) or user.get("is_active", False)
        if not is_verified:
            # Send fresh OTP for verification
            try:
                await OTPService.send_otp(clean_email, purpose="email_verification", user_name=user.get("full_name", ""))
            except HTTPException:
                pass  # Ignore cooldown error on login trigger

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email before logging in."
            )

        access_token = JWTService.create_access_token({"sub": str(user["_id"])})
        refresh_token = JWTService.create_refresh_token({"sub": str(user["_id"])})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE),
            "is_verified": True
        }

    @staticmethod
    async def google_login(id_token: str, db) -> dict:
        google_profile = await GoogleAuthService.verify_google_token(id_token)
        google_id = google_profile.get("google_id")
        email = google_profile.get("email")
        name = google_profile.get("name")
        picture = google_profile.get("picture")

        user = await UserService.find_by_google_id(google_id, db)
        if not user:
            user = await UserService.find_by_email(email, db)

        if user:
            # Update existing user with google_id and picture if missing
            update_data = {
                "is_verified": True,
                "is_active": True,
                "updated_at": datetime.utcnow()
            }
            if not user.get("google_id"):
                update_data["google_id"] = google_id
            if picture and not user.get("profile_picture"):
                update_data["profile_picture"] = picture
                update_data["avatar_url"] = picture

            await db["users"].update_one(
                {"_id": user["_id"]},
                {"$set": update_data}
            )
            user = await db["users"].find_one({"_id": user["_id"]})
        else:
            # Create new user via Google
            user = await UserService.create_user(
                email=email,
                full_name=name,
                provider="google",
                google_id=google_id,
                profile_picture=picture,
                is_verified=True,
                db=db
            )

        access_token = JWTService.create_access_token({"sub": str(user["_id"])})
        refresh_token = JWTService.create_refresh_token({"sub": str(user["_id"])})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE),
            "is_verified": True
        }

    @staticmethod
    async def resend_user_otp(email: str, purpose: str = "email_verification", db: Any = None) -> dict:
        clean_email = email.lower().strip()
        user = await UserService.find_by_email(clean_email, db)
        user_name = user.get("full_name", "") if user else ""

        await OTPService.resend_otp(clean_email, purpose=purpose, user_name=user_name)
        return {"success": True, "message": f"Verification code re-sent to {clean_email}"}

    @staticmethod
    async def verify_user_otp(email: str, otp: str, purpose: str = "email_verification", db: Any = None) -> dict:
        clean_email = email.lower().strip()
        is_valid = await OTPService.verify_otp(clean_email, otp, purpose=purpose)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code."
            )
            
        user = await UserService.find_by_email(clean_email, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_USER_NOT_FOUND
            )
            
        # Mark user verified in database
        await UserService.mark_user_verified(clean_email, db)
        user = await UserService.find_by_email(clean_email, db)
        
        access_token = JWTService.create_access_token({"sub": str(user["_id"])})
        refresh_token = JWTService.create_refresh_token({"sub": str(user["_id"])})
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE),
            "is_verified": True
        }

    @staticmethod
    async def refresh_token(refresh_token_str: str, db) -> dict:
        payload = JWTService.decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )
            
        user_id = payload.get("sub")
        user = await UserService.find_by_id(user_id, db)
        if not user or not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account inactive or not found."
            )

        new_access_token = JWTService.create_access_token({"sub": str(user["_id"])})
        new_refresh_token = JWTService.create_refresh_token({"sub": str(user["_id"])})
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE),
            "is_verified": True
        }

    @staticmethod
    async def logout_user(token_str: str, db) -> dict:
        from app.database import db_manager
        redis = db_manager.redis_client
        if redis and token_str:
            await redis.set(f"blacklist:{token_str}", "1", ex=86400)
        return {"success": True, "message": "Successfully logged out"}

    @staticmethod
    async def forgot_password(email: str, db) -> dict:
        clean_email = email.lower().strip()
        user = await UserService.find_by_email(clean_email, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account associated with this email address was found."
            )

        await OTPService.send_password_reset_otp(clean_email, user_name=user.get("full_name", ""))
        return {"success": True, "message": "Password recovery code sent to your email."}

    @staticmethod
    async def reset_password(email: str, otp: str, new_password: str, confirm_password: str = None, db: Any = None) -> dict:
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
        is_valid = await OTPService.verify_password_reset_otp(clean_email, otp)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password recovery code."
            )

        user = await UserService.find_by_email(clean_email, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_USER_NOT_FOUND
            )

        hashed_password = AuthService.get_password_hash(new_password)
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {
                "hashed_password": hashed_password,
                "is_verified": True,
                "is_active": True,
                "updated_at": datetime.utcnow()
            }}
        )

        return {"success": True, "message": "Password reset successfully. You can now login with your new credentials."}

    @staticmethod
    async def change_password(user_id: str, request: ChangePasswordRequest, db) -> dict:
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
        await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "hashed_password": hashed_password,
                "updated_at": datetime.utcnow()
            }}
        )

        return {"success": True, "message": "Password changed successfully."}

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
            
        update_data["updated_at"] = datetime.utcnow()
        await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        user = await UserService.find_by_id(user_id, db)
        if user:
            user["id"] = str(user["_id"])
        return user
