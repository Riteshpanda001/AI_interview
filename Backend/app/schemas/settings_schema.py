from pydantic import BaseModel, ConfigDict
from typing import Optional

class SettingsUpdateRequest(BaseModel):
    dark_mode: Optional[bool] = None
    email_notifications: Optional[bool] = None
    ai_voice_gender: Optional[str] = None
    preferred_language: Optional[str] = None
    target_role: Optional[str] = None
    target_experience_years: Optional[int] = None

class SettingsResponse(BaseModel):
    user_id: str
    dark_mode: bool
    email_notifications: bool
    ai_voice_gender: str
    preferred_language: str
    target_role: Optional[str]
    target_experience_years: Optional[int]

    model_config = ConfigDict(populate_by_name=True)
