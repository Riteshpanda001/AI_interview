from fastapi import APIRouter, Depends
from typing import List
from app.schemas.result_schema import InterviewResultResponse
from app.dependencies import get_current_active_user, get_db
from app.services.history_service import HistoryService

router = APIRouter()

@router.get("/interviews", response_model=List[InterviewResultResponse])
async def get_interview_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    history = await HistoryService.get_user_interview_history(
        user_id=str(current_user["_id"]),
        db=db
    )
    return history
