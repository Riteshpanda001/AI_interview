from datetime import datetime, timezone
from app.schemas.contact_schema import ContactCreateRequest

class ContactService:
    @staticmethod
    async def create_ticket(request: ContactCreateRequest, db) -> dict:
        ticket = {
            "name": request.name,
            "email": request.email,
            "subject": request.subject,
            "message": request.message,
            "status": "open",
            "created_at": datetime.now(timezone.utc)
        }
        result = await db["contacts"].insert_one(ticket)
        ticket["id"] = str(result.inserted_id)
        return ticket
