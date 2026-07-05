from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    email: EmailStr
    hashed_password: str
    full_name: str
    role: str = "user"
    plan_type: str = "free"  # free, pro, enterprise
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "role": "user",
                "plan_type": "free"
            }
        }
