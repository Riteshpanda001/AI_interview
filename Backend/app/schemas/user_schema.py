from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    plan_type: str
    is_active: bool
    is_verified: bool = False
    provider: Optional[str] = "email"
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None
    target_role: Optional[str] = "Software Engineer"
    experience_level: Optional[str] = "Mid Level"
    bio: Optional[str] = ""
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(populate_by_name=True)

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    profile_picture: Optional[str] = None
