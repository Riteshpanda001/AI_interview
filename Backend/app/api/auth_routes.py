import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from app.schemas.auth_schema import (
    UserRegisterRequest, UserLoginRequest, GoogleAuthRequest, TokenResponse, 
    OTPVerifyRequest, OTPResponse, EmailCheckRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    RefreshTokenRequest, ResendOTPRequest,
    RequestEmailChangeRequest, VerifyEmailChangeRequest,
    SendMobileOTPRequest, VerifyMobileOTPRequest,
    MFAStatusResponse, SetupTOTPResponse, EnableTOTPRequest,
    DisableTOTPRequest, TogglePhoneMFARequest, VerifyMFALoginRequest
)
from app.dependencies import get_db, oauth2_scheme, get_current_user, get_current_active_user
from app.services.auth_service import AuthService
from app.services.jwt_service import JWTService

router = APIRouter()

def _set_auth_cookies(response: Response, token_details: dict):
    if not response or not isinstance(token_details, dict):
        return
    access_token = token_details.get("access_token")
    refresh_token = token_details.get("refresh_token")
    if access_token:
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=False,
            max_age=86400 * 7
        )
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            secure=False,
            max_age=86400 * 30
        )

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
async def login(request: UserLoginRequest, http_request: Request, response: Response, db = Depends(get_db)):
    token_details = await AuthService.authenticate_user(request.email, request.password, db, req=http_request)
    _set_auth_cookies(response, token_details)
    return token_details

@router.post("/google", response_model=TokenResponse)
async def google_login(request: GoogleAuthRequest, http_request: Request, response: Response, db = Depends(get_db)):
    token_str = request.credential or request.id_token
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token credential is required."
        )
    token_details = await AuthService.google_login(token_str, db, req=http_request)
    _set_auth_cookies(response, token_details)
    return token_details

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerifyRequest, http_request: Request, response: Response, db = Depends(get_db)):
    purpose = request.purpose or "email_verification"
    token_details = await AuthService.verify_user_otp(request.email, request.otp, purpose=purpose, db=db, req=http_request)
    _set_auth_cookies(response, token_details)
    return token_details

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, http_request: Request, response: Response, db = Depends(get_db)):
    ref_token_str = request.refresh_token or http_request.cookies.get("refresh_token")
    if not ref_token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is required."
        )
    token_details = await AuthService.refresh_token(ref_token_str, db, req=http_request)
    _set_auth_cookies(response, token_details)
    return token_details

@router.post("/logout")
async def logout(http_request: Request, response: Response, token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    raw_token = token or http_request.cookies.get("access_token") or ""
    res = await AuthService.logout_user(raw_token, db, req=http_request)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return res


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, http_request: Request, db = Depends(get_db)):
    return await AuthService.forgot_password(request.email, db, req=http_request)

@router.post("/verify-password-reset-otp")
async def verify_password_reset_otp(request: OTPVerifyRequest, http_request: Request, db = Depends(get_db)):
    from app.services.otp_service import OTPService
    return await OTPService.verify_password_reset_otp(request.email, request.otp, req=http_request)

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, http_request: Request, db = Depends(get_db)):
    return await AuthService.reset_password(
        email=request.email,
        reset_token=request.reset_token,
        otp=request.otp,
        new_password=request.new_password,
        confirm_password=request.confirm_password,
        db=db,
        req=http_request
    )

@router.post("/send-mobile-otp")
async def send_mobile_otp(request: SendMobileOTPRequest, http_request: Request, db = Depends(get_db)):
    from app.services.otp_service import OTPService
    code = await OTPService.send_mobile_otp(request.phone, req=http_request)
    return {"success": True, "message": f"Verification SMS sent to {request.phone}"}

@router.post("/verify-mobile-otp")
async def verify_mobile_otp(request: VerifyMobileOTPRequest, http_request: Request, db = Depends(get_db)):
    from app.services.otp_service import OTPService
    return await OTPService.verify_mobile_otp(request.phone, request.otp, req=http_request)


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


@router.get("/mfa/status", response_model=MFAStatusResponse)
async def get_mfa_status(current_user = Depends(get_current_active_user)):
    return {
        "mfa_phone_enabled": current_user.get("mfa_phone_enabled", False),
        "mfa_totp_enabled": current_user.get("mfa_totp_enabled", False),
        "phone_verified": current_user.get("phone_verified", False),
        "phone": current_user.get("phone")
    }

@router.post("/mfa/setup-totp", response_model=SetupTOTPResponse)
async def setup_totp(current_user = Depends(get_current_active_user), db = Depends(get_db)):
    from app.services.totp_service import TOTPService
    secret = TOTPService.generate_secret()
    
    from bson import ObjectId
    try:
        query = {"_id": ObjectId(current_user["_id"])}
    except Exception:
        query = {"_id": current_user["_id"]}
        
    await db["users"].update_one(query, {"$set": {"totp_secret_temp": secret}})
    
    qr_uri = TOTPService.get_provisioning_uri(secret, current_user.get("email", "user@prepnova.ai"))
    qr_code_url = f"https://api.qrserver.com/v1/create-qr-code/?data={urllib.parse.quote(qr_uri)}&size=200x200"
    
    return {
        "secret": secret,
        "qr_code_url": qr_code_url
    }

@router.post("/mfa/enable-totp")
async def enable_totp(request: EnableTOTPRequest, current_user = Depends(get_current_active_user), db = Depends(get_db)):
    from app.services.totp_service import TOTPService
    temp_secret = current_user.get("totp_secret_temp")
    if not temp_secret:
        raise HTTPException(status_code=400, detail="TOTP setup has not been initiated. Please setup TOTP first.")
        
    is_valid = TOTPService.verify_code(temp_secret, request.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid verification code. TOTP setup failed.")
        
    from bson import ObjectId
    try:
        query = {"_id": ObjectId(current_user["_id"])}
    except Exception:
        query = {"_id": current_user["_id"]}
        
    await db["users"].update_one(query, {
        "$set": {
            "totp_secret": temp_secret,
            "mfa_totp_enabled": True
        },
        "$unset": {
            "totp_secret_temp": ""
        }
    })
    
    return {"success": True, "message": "Authenticator App MFA enabled successfully!"}

@router.post("/mfa/disable-totp")
async def disable_totp(request: DisableTOTPRequest, current_user = Depends(get_current_active_user), db = Depends(get_db)):
    from app.services.totp_service import TOTPService
    secret = current_user.get("totp_secret")
    if not secret:
        raise HTTPException(status_code=400, detail="TOTP is not enabled.")
        
    is_valid = TOTPService.verify_code(secret, request.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid verification code. Disabling TOTP failed.")
        
    from bson import ObjectId
    try:
        query = {"_id": ObjectId(current_user["_id"])}
    except Exception:
        query = {"_id": current_user["_id"]}
        
    await db["users"].update_one(query, {
        "$set": {
            "mfa_totp_enabled": False
        },
        "$unset": {
            "totp_secret": ""
        }
    })
    
    return {"success": True, "message": "Authenticator App MFA disabled successfully!"}

@router.post("/mfa/toggle-phone")
async def toggle_phone_mfa(request: TogglePhoneMFARequest, current_user = Depends(get_current_active_user), db = Depends(get_db)):
    if request.enabled and not current_user.get("phone_verified", False):
        raise HTTPException(status_code=400, detail="You must link and verify your phone number before enabling Phone OTP MFA.")
        
    from bson import ObjectId
    try:
        query = {"_id": ObjectId(current_user["_id"])}
    except Exception:
        query = {"_id": current_user["_id"]}
        
    await db["users"].update_one(query, {
        "$set": {
            "mfa_phone_enabled": request.enabled
        }
    })
    
    status_str = "enabled" if request.enabled else "disabled"
    return {"success": True, "message": f"Phone OTP MFA {status_str} successfully!"}

@router.post("/verify-mfa-login", response_model=TokenResponse)
async def verify_mfa_login(request: VerifyMFALoginRequest, http_request: Request, response: Response, db = Depends(get_db)):
    token_details = await AuthService.verify_mfa_login(
        email=request.email,
        otp=request.otp,
        mfa_type=request.mfa_type,
        db=db,
        req=http_request
    )
    _set_auth_cookies(response, token_details)
    return token_details

