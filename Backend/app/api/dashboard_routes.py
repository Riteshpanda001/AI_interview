from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.dashboard_schema import DashboardMetricsResponse, GoalCreate, GoalUpdate, GoalResponse
from app.dependencies import get_current_verified_user, get_db
from app.services.dashboard_service import DashboardService
from app.services.goal_service import GoalService
from app.services.activity_service import ActivityService

router = APIRouter()

@router.get("/", response_model=DashboardMetricsResponse)
async def get_dashboard_data(
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db)
):
    metrics = await DashboardService.get_user_dashboard(
        user_id=str(current_user["_id"]),
        db=db
    )
    return metrics

@router.get("/readiness")
async def get_readiness_index(
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db)
):
    metrics = await DashboardService.get_user_dashboard(user_id=str(current_user["_id"]), db=db)
    return metrics.get("readiness", {})

@router.get("/history")
async def get_performance_history(
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db)
):
    metrics = await DashboardService.get_user_dashboard(user_id=str(current_user["_id"]), db=db)
    return metrics.get("performance_history", {})

@router.get("/activity")
async def get_recent_activity(
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db)
):
    activities = await ActivityService.get_user_activities(user_id=str(current_user["_id"]), db=db, limit=20)
    return activities

@router.get("/recommendations")
async def get_ai_recommendations(
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db)
):
    metrics = await DashboardService.get_user_dashboard(user_id=str(current_user["_id"]), db=db)
    return metrics.get("recommendations", [])

# ── Goals CRUD Endpoints ──────────────────────────────────────────

@router.get("/goals")
async def get_user_goals(
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db)
):
    goals = await GoalService.get_user_goals(user_id=str(current_user["_id"]), db=db)
    return goals

@router.post("/goals", status_code=status.HTTP_201_CREATED)
async def create_user_goal(
    goal_in: GoalCreate,
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db)
):
    new_goal = await GoalService.create_goal(user_id=str(current_user["_id"]), goal_in=goal_in, db=db)
    return new_goal

@router.put("/goals/{goal_id}")
async def update_user_goal(
    goal_id: str,
    goal_in: GoalUpdate,
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db)
):
    updated = await GoalService.update_goal(user_id=str(current_user["_id"]), goal_id=goal_id, goal_in=goal_in, db=db)
    return updated

@router.delete("/goals/{goal_id}")
async def delete_user_goal(
    goal_id: str,
    current_user = Depends(get_current_verified_user),
    db = Depends(get_db)
):
    result = await GoalService.delete_goal(user_id=str(current_user["_id"]), goal_id=goal_id, db=db)
    return result

