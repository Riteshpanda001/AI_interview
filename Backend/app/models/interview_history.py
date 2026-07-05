from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class InterviewHistoryModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    interview_session_id: str
    role_target: str
    interview_type: str
    overall_score: int
    duration_seconds: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
