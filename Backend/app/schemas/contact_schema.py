from pydantic import BaseModel, EmailStr
from datetime import datetime

class ContactCreateRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    subject: str
    message: str
    status: str
    created_at: datetime

    class Config:
        populate_by_name = True
