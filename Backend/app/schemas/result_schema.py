from pydantic import BaseModel, ConfigDict
from typing import Dict
from datetime import datetime

class InterviewResultResponse(BaseModel):
    id: str
    interview_session_id: str
    overall_score: int
    scores_breakdown: Dict[str, int]
    verdict: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)
