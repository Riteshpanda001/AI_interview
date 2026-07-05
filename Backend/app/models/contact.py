from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class ContactModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    subject: str
    message: str
    status: str = "open"  # open, in_progress, resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
