from fastapi import APIRouter, Depends
from app.schemas.settings_schema import SettingsResponse, SettingsUpdateRequest
from app.dependencies import get_current_active_user, get_db
from app.services.settings_service import SettingsService

router = APIRouter()

@router.get("/", response_model=SettingsResponse)
async def get_user_settings(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    settings_data = await SettingsService.get_settings(
        user_id=str(current_user["_id"]),
        db=db
    )
    return settings_data

@router.put("/", response_model=SettingsResponse)
async def update_user_settings(
    request: SettingsUpdateRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    settings_data = await SettingsService.update_settings(
        user_id=str(current_user["_id"]),
        req=request,
        db=db
    )
    return settings_data
