from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UserSettingsModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    dark_mode: bool = True
    email_notifications: bool = True
    ai_voice_gender: str = "female"  # male, female
    preferred_language: str = "en"
    target_role: Optional[str] = None
    target_experience_years: Optional[int] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
