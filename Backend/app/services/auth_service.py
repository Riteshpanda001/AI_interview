from fastapi import HTTPException, status
import bcrypt
from app.schemas.auth_schema import UserRegisterRequest, UserLoginRequest
from app.schemas.user_schema import UserUpdateRequest
from app.services.jwt_service import JWTService
from app.services.otp_service import OTPService
from app.services.email_service import EmailService
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
            "is_active": False, # Requires OTP verification first
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
            
        if not user.get("is_active", True):
            # Account exists but not verified. Resend OTP and notify
            await OTPService.send_otp(email)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account not verified. A verification code has been sent to your email. Please verify."
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
            
        # Activate user in database
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
        )
        
        # Send confirmation email
        subject = "Welcome to PreNovaAi - Account Created Successfully!"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 12px; background-color: #05020c; color: #ffffff; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.15);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #c084fc; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">PreNovaAi</h1>
                <p style="color: #a3a3c2; margin: 5px 0 0 0; font-size: 14px;">Next-Gen AI Interview Preparation</p>
            </div>
            <hr style="border: 0; border-top: 1px solid rgba(168, 85, 247, 0.15); margin: 20px 0;" />
            <h2 style="color: #ffffff; margin-top: 0; font-size: 20px; font-weight: 600;">Welcome aboard, {user.get("full_name", "User")}! 🚀</h2>
            <p style="color: #a3a3c2; font-size: 15px; line-height: 1.6;">Your account on <b>PreNovaAi</b> has been successfully created and verified.</p>
            <p style="color: #a3a3c2; font-size: 15px; line-height: 1.6;">You now have full access to our complete AI-powered interview preparation platform, which includes:</p>
            <ul style="color: #a3a3c2; font-size: 15px; line-height: 1.6; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">AI Mock Interviews:</strong> Real-time behavioral & technical practice with smart grading.</li>
                <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">ATS Resume Scoring:</strong> Instant analysis and optimization recommendations.</li>
                <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Coding Practice Sandbox:</strong> Solve problems and get direct feedback on code quality.</li>
                <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Company Preparation:</strong> Targeted questions for top tech firms.</li>
            </ul>
            <div style="text-align: center; margin: 35px 0;">
                <a href="http://localhost:5173/login" style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); display: inline-block;">Start Preparing</a>
            </div>
            <p style="color: #a3a3c2; font-size: 14px; line-height: 1.6; margin-top: 30px;">Happy Prep!<br/>The PreNovaAi Team</p>
            <hr style="border: 0; border-top: 1px solid rgba(168, 85, 247, 0.15); margin: 20px 0;" />
            <p style="color: #52527a; font-size: 11px; text-align: center; margin: 0;">This email was sent by PreNovaAi. Please do not reply directly to this mail.</p>
        </div>
        """
        await EmailService.send_email(email, subject, html_content)
        
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
