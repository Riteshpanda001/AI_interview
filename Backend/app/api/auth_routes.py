from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth_schema import UserRegisterRequest, UserLoginRequest, TokenResponse, OTPVerifyRequest, OTPResponse
from app.dependencies import get_db
from app.services.auth_service import AuthService
from app.services.jwt_service import JWTService

router = APIRouter()

@router.post("/register", response_model=OTPResponse, status_code=status.HTTP_201_CREATED)
async def register(request: UserRegisterRequest, db = Depends(get_db)):
    result = await AuthService.register_user(request, db)
    return result

@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest, db = Depends(get_db)):
    token_details = await AuthService.authenticate_user(request.email, request.password, db)
    return token_details

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerifyRequest, db = Depends(get_db)):
    token_details = await AuthService.verify_user_otp(request.email, request.otp, db)
    return token_details
