from fastapi import APIRouter, Depends, UploadFile, File
from app.schemas.interview_schema import InterviewCreateRequest, InterviewSessionResponse, SubmitAnswerRequest
from app.schemas.feedback_schema import InterviewFeedbackResponse
from app.dependencies import get_current_active_user, get_db
from app.services.interview_service import InterviewService

router = APIRouter()

@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(
    request: InterviewCreateRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    session = await InterviewService.create_session(
        user_id=str(current_user["_id"]),
        role_target=request.role_target,
        interview_type=request.interview_type,
        db=db
    )
    return session

@router.post("/{session_id}/answer", response_model=InterviewFeedbackResponse)
async def submit_answer(
    session_id: str,
    request: SubmitAnswerRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    feedback = await InterviewService.evaluate_answer(
        user_id=str(current_user["_id"]),
        session_id=session_id,
        submit_req=request,
        db=db
    )
    return feedback
