from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class CompanyModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    slug: str
    description: str
    industry: str
    interview_process: List[Dict[str, str]] = Field(default_factory=list)  # e.g., [{"round_name": "Online Assessment", "details": "..."}]
    typical_questions: List[Dict[str, str]] = Field(default_factory=list)  # sample questions
    logo_url: Optional[str] = None

    class Config:
        populate_by_name = True
