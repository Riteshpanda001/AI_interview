from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ATSAnalysisModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    resume_id: str
    job_description: str
    score: int  # 0 to 100
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    detailed_feedback: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
