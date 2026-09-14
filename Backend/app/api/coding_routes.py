from fastapi import APIRouter, Depends
from typing import List
from app.schemas.coding_schema import CodingProblemResponse, CodingSubmitRequest, CodingSubmissionResponse, CodingSubmissionHistoryItem
from app.dependencies import get_current_active_user, get_db
from app.services.coding_service import CodingService

router = APIRouter()

# ── Problems ──────────────────────────────────────────────────────────────────

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

# ── User history & statistics ─────────────────────────────────────────────────

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

# ── Leaderboard ───────────────────────────────────────────────────────────────

@router.get("/leaderboard")
async def get_leaderboard(
    db = Depends(get_db)
):
    """
    Public endpoint — returns top 10 users ranked by problems solved.
    No authentication required so the leaderboard is visible to all visitors.
    """
    return await CodingService.get_leaderboard(db, limit=10)

# ── Daily Challenge ───────────────────────────────────────────────────────────

@router.get("/daily-challenge")
async def get_daily_challenge():
    """
    Public endpoint — returns today's rotating challenge (no auth required).
    The challenge rotates deterministically once per calendar day.
    """
    return await CodingService.get_daily_challenge()

@router.post("/daily-challenge/complete")
async def complete_daily_challenge(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Marks today's daily challenge as completed for the logged-in user.
    Updates streak counter and prevents double-counting the same day.
    """
    user_id = str(current_user["_id"])
    challenge = await CodingService.get_daily_challenge()
    return await CodingService.complete_daily_challenge(
        user_id=user_id,
        challenge_slug=challenge["slug"],
        db=db
    )

# ── Streak ────────────────────────────────────────────────────────────────────

@router.get("/streak")
async def get_user_streak(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Returns the logged-in user's current streak, longest streak,
    today's completion status, and total days practiced.
    """
    user_id = str(current_user["_id"])
    return await CodingService.get_user_streak(user_id, db)
