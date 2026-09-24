from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.dependencies import get_current_active_user, get_db
from app.services.history_service import HistoryService

router = APIRouter()


@router.get("/interviews")
async def get_interview_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Returns the authenticated user's completed AI mock interview sessions.
    Reads from interview_sessions collection (status=completed).
    """
    user_id = str(current_user["_id"])
    history = await HistoryService.get_user_interview_history(user_id=user_id, db=db)
    return history


@router.get("/coding")
async def get_coding_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Returns the authenticated user's coding problem submission history.
    Reads from coding_submissions collection.
    """
    user_id = str(current_user["_id"])
    return await HistoryService.get_user_coding_history(user_id=user_id, db=db)


@router.get("/ats")
async def get_ats_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Returns the authenticated user's ATS resume analysis history.
    Reads from ats_results collection.
    """
    user_id = str(current_user["_id"])
    return await HistoryService.get_user_ats_history(user_id=user_id, db=db)


@router.delete("/ats/{ats_id}")
async def delete_ats_history_item(
    ats_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Deletes a specific ATS scan entry from history.
    """
    user_id = str(current_user["_id"])
    deleted = await HistoryService.delete_ats_history_item(user_id=user_id, ats_id=ats_id, db=db)
    if not deleted:
        raise HTTPException(status_code=404, detail="ATS history item not found")
    return {"message": "ATS history item deleted", "deleted": True}


@router.delete("/ats")
async def clear_all_ats_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Clears all ATS analysis history for the current user.
    """
    user_id = str(current_user["_id"])
    count = await HistoryService.clear_all_ats_history(user_id=user_id, db=db)
    return {"message": f"Cleared {count} ATS history records", "count": count}


@router.get("/resumes")
async def get_resume_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Returns the authenticated user's saved resume drafts.
    Reads from resumes collection.
    """
    user_id = str(current_user["_id"])
    return await HistoryService.get_user_resume_history(user_id=user_id, db=db)


@router.delete("/resumes/{resume_id}")
async def delete_resume_history_item(
    resume_id: str,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Deletes a specific resume from the user's resume history.
    """
    user_id = str(current_user["_id"])
    deleted = await HistoryService.delete_resume_history_item(user_id=user_id, resume_id=resume_id, db=db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resume history record not found")
    return {"message": "Resume deleted successfully", "deleted": True}


@router.delete("/resumes")
async def clear_all_resume_history(
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Clears all resume history records for the authenticated user.
    """
    user_id = str(current_user["_id"])
    count = await HistoryService.clear_all_resume_history(user_id=user_id, db=db)
    return {"message": f"Successfully deleted {count} resume history records", "count": count}
