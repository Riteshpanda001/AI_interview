from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ResumeResponse(BaseModel):
    id: str
    filename: str
    parsed_content: Dict[str, Any]
    created_at: datetime

    class Config:
        populate_by_name = True
