from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ATSAnalysisRequest(BaseModel):
    resume_id: Optional[str] = ""
    job_description: str

class ATSAnalysisResponse(BaseModel):
    id: str
    resume_id: Optional[str] = ""
    score: int
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]
    detailed_feedback: str
    created_at: datetime

    class Config:
        populate_by_name = True

class TailorResumeRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str
