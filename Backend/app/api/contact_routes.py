from fastapi import APIRouter, Depends
from app.schemas.contact_schema import ContactCreateRequest, ContactResponse
from app.dependencies import get_db
from app.services.contact_service import ContactService

router = APIRouter()

@router.post("/", response_model=ContactResponse)
async def submit_contact_form(
    request: ContactCreateRequest,
    db = Depends(get_db)
):
    ticket = await ContactService.create_ticket(request, db)
    return ticket
