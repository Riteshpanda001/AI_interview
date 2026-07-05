from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class CodingSubmissionModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    problem_id: str
    language: str
    submitted_code: str
    status: str = "pending"  # pending, accepted, wrong_answer, compile_error
    run_time_ms: Optional[int] = None
    evaluation_result: Dict[str, Any] = Field(default_factory=dict)  # AI compiler feedback structure
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
