from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.schemas.auth_schema import (
    UserRegisterRequest, UserLoginRequest, GoogleAuthRequest, TokenResponse, 
    OTPVerifyRequest, OTPResponse, EmailCheckRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    RefreshTokenRequest, ResendOTPRequest
)
from app.dependencies import get_db, oauth2_scheme
from app.services.auth_service import AuthService
from app.services.jwt_service import JWTService

router = APIRouter()

@router.post("/check-email")
async def check_email(request: EmailCheckRequest, db = Depends(get_db)):
    user = await db["users"].find_one({"email": request.email.lower().strip()})
    return {"exists": user is not None}

@router.post("/register", response_model=OTPResponse, status_code=status.HTTP_201_CREATED)
async def register(request: UserRegisterRequest, db = Depends(get_db)):
    result = await AuthService.register_user(request, db)
    return result

@router.post("/resend-otp", response_model=OTPResponse)
async def resend_otp(request: ResendOTPRequest, db = Depends(get_db)):
    purpose = request.purpose or "email_verification"
    return await AuthService.resend_user_otp(request.email, purpose=purpose, db=db)

@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest, http_request: Request, db = Depends(get_db)):
    token_details = await AuthService.authenticate_user(request.email, request.password, db, req=http_request)
    return token_details

@router.post("/google", response_model=TokenResponse)
async def google_login(request: GoogleAuthRequest, http_request: Request, db = Depends(get_db)):
    token_str = request.credential or request.id_token
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token credential is required."
        )
    return await AuthService.google_login(token_str, db, req=http_request)

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerifyRequest, http_request: Request, db = Depends(get_db)):
    purpose = request.purpose or "email_verification"
    token_details = await AuthService.verify_user_otp(request.email, request.otp, purpose=purpose, db=db, req=http_request)
    return token_details

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db = Depends(get_db)):
    return await AuthService.refresh_token(request.refresh_token, db)

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    return await AuthService.logout_user(token, db)

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db = Depends(get_db)):
    return await AuthService.forgot_password(request.email, db)

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db = Depends(get_db)):
    return await AuthService.reset_password(
        email=request.email,
        otp=request.otp,
        new_password=request.new_password,
        confirm_password=request.confirm_password,
        db=db
    )
