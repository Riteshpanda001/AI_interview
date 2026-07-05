from fastapi import APIRouter, Depends
from app.schemas.dashboard_schema import DashboardMetricsResponse
from app.dependencies import get_current_active_user, get_db
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/", response_model=DashboardMetricsResponse)
async def get_dashboard_data(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    metrics = await DashboardService.get_user_dashboard(
        user_id=str(current_user["_id"]),
        db=db
    )
    return metrics
