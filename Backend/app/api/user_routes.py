from fastapi import APIRouter, Depends
from app.schemas.user_schema import UserResponse, UserUpdateRequest
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
