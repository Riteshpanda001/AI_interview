from fastapi import APIRouter, Depends
from typing import List
from app.schemas.coding_schema import CodingProblemResponse, CodingSubmitRequest, CodingSubmissionResponse, CodingSubmissionHistoryItem
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

@router.get("/problems/{problem_id}/submissions", response_model=List[CodingSubmissionHistoryItem])
async def get_problem_submissions(
    problem_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await CodingService.get_user_submission_history(user_id, problem_id, db)

@router.get("/history")
async def get_coding_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await CodingService.get_user_all_submissions(user_id, db)

@router.get("/statistics")
async def get_coding_statistics(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    user_id = str(current_user["_id"])
    return await CodingService.get_user_coding_statistics(user_id, db)


