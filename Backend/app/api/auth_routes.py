from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.schemas.auth_schema import (
    UserRegisterRequest, UserLoginRequest, GoogleAuthRequest, TokenResponse, 
    OTPVerifyRequest, OTPResponse, EmailCheckRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    RefreshTokenRequest, ResendOTPRequest,
    RequestEmailChangeRequest, VerifyEmailChangeRequest
)
from app.dependencies import get_db, oauth2_scheme, get_current_user
from app.services.auth_service import AuthService
from app.services.jwt_service import JWTService

router = APIRouter()

@router.post("/check-email")
async def check_email(request: EmailCheckRequest, db = Depends(get_db)):
    user = await db["users"].find_one({"email": request.email.lower().strip()})
    return {"exists": user is not None}

@router.post("/register", response_model=OTPResponse, status_code=status.HTTP_201_CREATED)
async def register(request: UserRegisterRequest, http_request: Request, db = Depends(get_db)):
    result = await AuthService.register_user(request, db, req=http_request)
    return result

@router.post("/resend-otp", response_model=OTPResponse)
async def resend_otp(request: ResendOTPRequest, http_request: Request, db = Depends(get_db)):
    purpose = request.purpose or "email_verification"
    return await AuthService.resend_user_otp(request.email, purpose=purpose, db=db, req=http_request)

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
async def refresh_token(request: RefreshTokenRequest, http_request: Request, db = Depends(get_db)):
    return await AuthService.refresh_token(request.refresh_token, db, req=http_request)

@router.post("/logout")
async def logout(http_request: Request, token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    return await AuthService.logout_user(token, db, req=http_request)

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, http_request: Request, db = Depends(get_db)):
    return await AuthService.forgot_password(request.email, db, req=http_request)

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, http_request: Request, db = Depends(get_db)):
    return await AuthService.reset_password(
        email=request.email,
        otp=request.otp,
        new_password=request.new_password,
        confirm_password=request.confirm_password,
        db=db,
        req=http_request
    )

@router.post("/request-email-change")
async def request_email_change(
    request: RequestEmailChangeRequest,
    http_request: Request,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    return await AuthService.request_email_change(
        user_id=str(current_user["_id"]),
        request=request,
        db=db,
        req=http_request
    )

@router.post("/verify-email-change")
async def verify_email_change(
    request: VerifyEmailChangeRequest,
    http_request: Request,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    return await AuthService.verify_email_change(
        user_id=str(current_user["_id"]),
        request=request,
        db=db,
        req=http_request
    )

