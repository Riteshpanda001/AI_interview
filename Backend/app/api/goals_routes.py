from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.dashboard_schema import GoalCreate, GoalUpdate, GoalResponse
from app.dependencies import get_current_active_user, get_db
from app.services.goal_service import GoalService

router = APIRouter()

@router.get("/")
async def get_goals(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await GoalService.get_user_goals(user_id, db)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_in: GoalCreate,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await GoalService.create_goal(user_id, goal_in, db)

@router.put("/{goal_id}")
async def update_goal(
    goal_id: str,
    goal_in: GoalUpdate,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await GoalService.update_goal(user_id, goal_id, goal_in, db)

@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await GoalService.delete_goal(user_id, goal_id, db)
