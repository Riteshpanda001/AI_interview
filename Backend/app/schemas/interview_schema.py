from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class InterviewCreateRequest(BaseModel):
    role_target: str
    interview_type: str = "technical"  # hr, technical, behavioral
    experience_level: Optional[str] = None
    language: Optional[str] = "English"
    duration: Optional[int] = 10
    difficulty: Optional[str] = "Medium"
    resume_id: Optional[str] = None

class QuestionResponse(BaseModel):
    question_id: str
    text: str
    type: str

class InterviewSessionResponse(BaseModel):
    id: str
    role_target: str
    interview_type: str
    status: str
    questions: List[QuestionResponse]
    created_at: datetime

    class Config:
        populate_by_name = True

class SubmitAnswerRequest(BaseModel):
    question_id: str
    answer_text: str
    audio_file_path: Optional[str] = None
