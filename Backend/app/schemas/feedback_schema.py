from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.schemas.interview_schema import QuestionResponse

class AnswerFeedbackResponse(BaseModel):
    question_id: str
    question_text: str
    user_answer: str
    score: int
    strengths: List[str]
    weaknesses: List[str]
    suggested_answer: str
    tone_sentiment: Optional[str] = None

class InterviewFeedbackResponse(BaseModel):
    id: str
    interview_session_id: str
    answers_feedback: List[AnswerFeedbackResponse]
    overall_summary: str
    questions: Optional[List[QuestionResponse]] = None
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)

