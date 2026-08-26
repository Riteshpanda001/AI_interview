from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class ContactCreateRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    captcha_answer: int
    captcha_expected: int
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

    model_config = ConfigDict(populate_by_name=True)

class TicketStatusResponse(BaseModel):
    ticket_number: str
    status: str
    name: str
    email: str
    subject: str
    created_at: datetime
    estimated_response: str = "Within 24 Hours"
