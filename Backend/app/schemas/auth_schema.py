from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: Optional[str] = None
    full_name: str = Field(..., min_length=3)
    phone: Optional[str] = None
    gender: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    credential: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    role: Optional[str] = None
    plan_type: Optional[str] = None
    require_otp: Optional[bool] = False
    is_verified: Optional[bool] = True
    message: Optional[str] = None
    email: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ResendOTPRequest(BaseModel):
    email: EmailStr
    purpose: Optional[str] = "email_verification"

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    purpose: Optional[str] = "email_verification"

class OTPResponse(BaseModel):
    success: bool
    message: str

class EmailCheckRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=6)
    reset_token: Optional[str] = None
    otp: Optional[str] = None
    confirm_password: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)
    confirm_password: Optional[str] = None

class RequestEmailChangeRequest(BaseModel):
    new_email: EmailStr
    password: str

class VerifyEmailChangeRequest(BaseModel):
    new_email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class SendMobileOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10)

class VerifyMobileOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10)
    otp: str = Field(..., min_length=6, max_length=6)

class MFAStatusResponse(BaseModel):
    mfa_phone_enabled: bool
    mfa_totp_enabled: bool
    phone_verified: bool
    phone: Optional[str] = None

class SetupTOTPResponse(BaseModel):
    secret: str
    qr_code_url: str

class EnableTOTPRequest(BaseModel):
    code: str

class DisableTOTPRequest(BaseModel):
    code: str

class TogglePhoneMFARequest(BaseModel):
    enabled: bool

class VerifyMFALoginRequest(BaseModel):
    email: EmailStr
    otp: str
    mfa_type: str



