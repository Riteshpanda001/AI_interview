from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ResumeModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    filename: str
    file_path: str
    file_size: int
    parsed_content: Dict[str, Any] = Field(default_factory=dict)  # Extracted structured info
    extracted_text: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
