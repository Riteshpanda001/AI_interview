from fastapi import APIRouter, Depends
from typing import List
from app.schemas.coding_schema import CodingProblemResponse, CodingSubmitRequest, CodingSubmissionResponse
from app.dependencies import get_current_active_user, get_db
from app.services.coding_service import CodingService

router = APIRouter()

@router.get("/problems", response_model=List[CodingProblemResponse])
async def list_problems(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    problems = await CodingService.get_all_problems(db)
    return problems

@router.post("/problems/{problem_id}/submit", response_model=CodingSubmissionResponse)
async def submit_problem_solution(
    problem_id: str,
    request: CodingSubmitRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    submission = await CodingService.evaluate_submission(
        user_id=str(current_user["_id"]),
        problem_id=problem_id,
        language=request.language,
        submitted_code=request.submitted_code,
        db=db
    )
    return submission
