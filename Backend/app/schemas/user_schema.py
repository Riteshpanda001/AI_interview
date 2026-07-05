from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    plan_type: str
    is_active: bool

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
