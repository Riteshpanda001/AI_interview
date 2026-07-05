from pydantic import BaseModel
from typing import Dict
from datetime import datetime

class InterviewResultResponse(BaseModel):
    id: str
    interview_session_id: str
    overall_score: int
    scores_breakdown: Dict[str, int]
    verdict: str
    created_at: datetime

    class Config:
        populate_by_name = True
