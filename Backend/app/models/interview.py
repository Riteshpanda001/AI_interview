from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class InterviewSessionModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    role_target: str
    interview_type: str  # hr, technical, behavioral
    status: str = "pending"  # pending, completed
    questions: List[Dict[str, Any]] = Field(default_factory=list)  # generated questions with options/answers
    responses: List[Dict[str, Any]] = Field(default_factory=list)  # user answers and audio paths
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
