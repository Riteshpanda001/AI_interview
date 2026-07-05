from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AnswerFeedback(BaseModel):
    question_id: str
    question_text: str
    user_answer: str
    score: int  # 0 to 10
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggested_answer: str
    tone_sentiment: Optional[str] = None

class InterviewFeedbackModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    interview_session_id: str
    user_id: str
    answers_feedback: List[AnswerFeedback] = Field(default_factory=list)
    overall_summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
