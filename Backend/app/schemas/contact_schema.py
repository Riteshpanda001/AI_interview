from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ContactCreateRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    captcha_answer: Optional[int] = None
    captcha_expected: Optional[int] = None
    website: Optional[str] = None  # Honeypot spam trap (must remain empty for real users)

class ContactResponse(BaseModel):
    id: str
    ticket_number: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    status: str
    created_at: datetime

    class Config:
        populate_by_name = True

class TicketStatusResponse(BaseModel):
    ticket_number: str
    status: str
    name: str
    email: str
    subject: str
    created_at: datetime
    estimated_response: str = "Within 24 Hours"
