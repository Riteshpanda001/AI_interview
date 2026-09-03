from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any, Optional
from app.dependencies import get_current_active_user, get_db
from app.services.activity_service import ActivityService

router = APIRouter()

@router.get("/")
async def get_user_activities(
    limit: int = Query(default=50, ge=1, le=200),
    activity_type: Optional[str] = None,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    activities = await ActivityService.get_user_activities(user_id, db, limit=limit)
    if activity_type and activity_type.lower() != "all":
        activities = [a for a in activities if a.get("type", "").lower() == activity_type.lower()]
    return activities
