from fastapi import APIRouter, Depends, Request
from app.schemas.contact_schema import ContactCreateRequest, ContactResponse, TicketStatusResponse
from app.dependencies import get_db
from app.services.contact_service import ContactService

router = APIRouter()

@router.post("/", response_model=ContactResponse)
async def submit_contact_form(
    request: ContactCreateRequest,
    req: Request,
    db = Depends(get_db)
):
    client_ip = req.client.host if req.client else "127.0.0.1"
    ticket = await ContactService.create_ticket(request, db=db, client_ip=client_ip)
    return ticket

@router.get("/ticket/{ticket_number}", response_model=TicketStatusResponse)
async def check_ticket_status(
    ticket_number: str,
    db = Depends(get_db)
):
    return await ContactService.get_ticket_status(ticket_number, db=db)
