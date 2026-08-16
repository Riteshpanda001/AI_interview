from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List, Optional, Dict, Any
from app.schemas.ats_schema import ATSAnalysisRequest, ATSAnalysisResponse, TailorResumeRequest, ParseJobDescriptionResponse
from app.dependencies import get_current_active_user, get_db
from app.services.ats_service import ATSService
from app.services.payment_service import SubscriptionEnforcer

router = APIRouter()

@router.post("/analyze", response_model=ATSAnalysisResponse)
async def analyze_resume_ats(
    request: ATSAnalysisRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    await SubscriptionEnforcer.enforce_ats_check_limit(str(current_user["_id"]), db)

    analysis = await ATSService.analyze_ats_score(
        user_id=str(current_user["_id"]),
        resume_id=request.resume_id,
        job_description=request.job_description,
        db=db,
        resume_data=request.resume_data,
        resume_text=request.resume_text,
        job_title=getattr(request, "job_title", ""),
        experience_level=getattr(request, "experience_level", "Mid Level"),
        target_company=getattr(request, "target_company", ""),
        target_location=getattr(request, "target_location", "")
    )
    return analysis

@router.post("/parse-jd", response_model=ParseJobDescriptionResponse)
async def parse_job_description_file(
    file: UploadFile = File(...),
    current_user = Depends(get_current_active_user)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    return await ATSService.parse_jd_file(file)

@router.post("/tailor")
async def tailor_resume(
    request: TailorResumeRequest,
    current_user = Depends(get_current_active_user)
):
    return await ATSService.tailor_resume(
        resume_data=request.resume_data,
        job_description=request.job_description
    )

@router.get("/history", response_model=List[ATSAnalysisResponse])
async def get_ats_history(
    resume_id: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db),
):
    """Return historical ATS analyses for a given resume or user.
    If both resume_id and user_id are provided, resume_id takes precedence.
    """
    query: Dict[str, Any] = {}
    if resume_id:
        query["resume_id"] = resume_id
    elif user_id:
        query["user_id"] = user_id
    else:
        # default to current user
        query["user_id"] = str(current_user["_id"])
    # Ensure only analyses belonging to the current user are returned
    if "user_id" in query and str(current_user["_id"]) != query["user_id"]:
        raise HTTPException(status_code=403, detail="Forbidden: cannot access other users' history")
    analyses = await db["ats_analyses"].find(query).sort("created_at", 1).to_list(length=None)
    for doc in analyses:
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        doc["id"] = str(doc.get("_id", ""))
    return analyses