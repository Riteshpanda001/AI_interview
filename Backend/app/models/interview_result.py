from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, Field

class InterviewResultModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    interview_session_id: str
    user_id: str
    overall_score: int
    scores_breakdown: Dict[str, int] = Field(default_factory=dict)  # e.g., {"communication": 80, "technical": 75, "confidence": 90}
    verdict: str  # Hire, Strong Hire, No Hire
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
