from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel
from app.schemas.interview_schema import InterviewCreateRequest, InterviewSessionResponse, SubmitAnswerRequest
from app.schemas.feedback_schema import InterviewFeedbackResponse
from app.dependencies import get_current_active_user, get_db
from app.services.interview_service import InterviewService
from app.services.speech_service import SpeechService
from app.services.payment_service import SubscriptionEnforcer

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    voice_gender: str = "female"
    language: str = "en"

@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(
    request: InterviewCreateRequest,
    current_user = Depends(get_current_active_user),
    db = Depends(get_db)
):
    # Enforce plan feature limits on backend
    await SubscriptionEnforcer.enforce_mock_interview_limit(str(current_user["_id"]), db)

    session = await InterviewService.create_session(
        user_id=str(current_user["_id"]),
        role_target=request.role_target,
        interview_type=request.interview_type,
        experience_level=request.experience_level,
        language=request.language,
        duration=request.duration,
        difficulty=request.difficulty,
        resume_id=request.resume_id,
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

@router.post("/tts")
async def generate_tts(request: TTSRequest):
    voice_url = await SpeechService.text_to_speech(
        text=request.text,
        voice_gender=request.voice_gender,
        language=request.language
    )
    return {"voice_url": voice_url, "text": request.text}
