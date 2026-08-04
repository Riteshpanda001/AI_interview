from fastapi import APIRouter, Depends, Body
from app.schemas.user_schema import UserResponse, UserUpdateRequest
from app.schemas.auth_schema import ChangePasswordRequest
from app.dependencies import get_current_active_user, get_db
from app.services.auth_service import AuthService
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_active_user)):
    # Convert _id to string for Pydantic mapping
    current_user["id"] = str(current_user["_id"])
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(
    request: UserUpdateRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    updated_user = await AuthService.update_user_profile(str(current_user["_id"]), request, db)
    return updated_user

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await AuthService.change_password(str(current_user["_id"]), request, db)

@router.get("/sessions")
async def get_sessions(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await AuthService.get_user_sessions(str(current_user["_id"]), db=db)

@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await AuthService.revoke_session(str(current_user["_id"]), session_id, db=db)

@router.post("/sessions/revoke-others")
async def revoke_other_sessions(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await AuthService.revoke_other_sessions(str(current_user["_id"]), db=db)

@router.get("/login-activity")
async def get_login_activity(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    return await AuthService.get_login_activity(
        user_id=str(current_user["_id"]),
        email=current_user.get("email", ""),
        db=db
    )

@router.delete("/me")
async def delete_account(
    payload: dict = Body(default={}),
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    password = payload.get("password") if isinstance(payload, dict) else None
    return await AuthService.delete_user_account(
        user_id=str(current_user["_id"]),
        password=password,
        db=db
    )

