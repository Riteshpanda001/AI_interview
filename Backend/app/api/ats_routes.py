from fastapi import APIRouter, Depends
from app.schemas.ats_schema import ATSAnalysisRequest, ATSAnalysisResponse
from app.dependencies import get_current_active_user, get_db
from app.services.ats_service import ATSService

router = APIRouter()

@router.post("/analyze", response_model=ATSAnalysisResponse)
async def analyze_resume_ats(
    request: ATSAnalysisRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    analysis = await ATSService.analyze_ats_score(
        user_id=str(current_user["_id"]),
        resume_id=request.resume_id,
        job_description=request.job_description,
        db=db
    )
    return analysis
