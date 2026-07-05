from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
    created_at: datetime

    class Config:
        populate_by_name = True
