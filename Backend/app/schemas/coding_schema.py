from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class CodingProblemResponse(BaseModel):
    id: str
    title: str
    slug: str
    difficulty: str
    description: str
    starter_code: Dict[str, str]

    class Config:
        populate_by_name = True

class CodingSubmitRequest(BaseModel):
    language: str
    submitted_code: str

class CodingSubmissionResponse(BaseModel):
    id: str
    problem_id: str
    language: str
    submitted_code: str
    status: str
    run_time_ms: Optional[int]
    evaluation_result: Dict[str, Any]
    created_at: datetime

    class Config:
        populate_by_name = True
