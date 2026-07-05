from fastapi import HTTPException, status
import bcrypt
from app.schemas.auth_schema import UserRegisterRequest, UserLoginRequest
from app.schemas.user_schema import UserUpdateRequest
from app.services.jwt_service import JWTService
from app.services.otp_service import OTPService
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
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        try:
            return bcrypt.checkpw(pwd_bytes, hashed_bytes)
        except Exception:
            return False

    @staticmethod
    async def register_user(request: UserRegisterRequest, db) -> dict:
        # Check if user already exists
        existing_user = await db["users"].find_one({"email": request.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )

        hashed_password = AuthService.get_password_hash(request.password)
        new_user = {
            "email": request.email,
            "hashed_password": hashed_password,
            "full_name": request.full_name,
            "role": ROLE_USER,
            "plan_type": PLAN_FREE,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db["users"].insert_one(new_user)
        
        # Send OTP
        await OTPService.send_otp(request.email)
        
        return {"success": True, "message": "User registered. Please verify your OTP email."}

    @staticmethod
    async def authenticate_user(email: str, password: str, db) -> dict:
        user = await db["users"].find_one({"email": email})
        if not user or not AuthService.verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_INVALID_CREDENTIALS
            )
            
        token = JWTService.create_access_token({"sub": str(user["_id"])})
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE)
        }

    @staticmethod
    async def verify_user_otp(email: str, otp: str, db) -> dict:
        is_valid = await OTPService.verify_otp(email, otp)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code"
            )
            
        user = await db["users"].find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_USER_NOT_FOUND
            )
            
        token = JWTService.create_access_token({"sub": str(user["_id"])})
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user.get("role", ROLE_USER),
            "plan_type": user.get("plan_type", PLAN_FREE)
        }

    @staticmethod
    async def update_user_profile(user_id: str, request: UserUpdateRequest, db) -> dict:
        update_data = {}
        if request.full_name is not None:
            update_data["full_name"] = request.full_name
        if request.password is not None:
            update_data["hashed_password"] = AuthService.get_password_hash(request.password)
            
        if not update_data:
            user = await db["users"].find_one({"_id": ObjectId(user_id)})
            user["id"] = str(user["_id"])
            return user
            
        update_data["updated_at"] = datetime.utcnow()
        await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        user["id"] = str(user["_id"])
        return user
