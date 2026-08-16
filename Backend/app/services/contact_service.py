from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status
from app.schemas.contact_schema import ContactCreateRequest
from app.services.email_service import EmailService
import random

class ContactService:
    @staticmethod
    async def create_ticket(request: ContactCreateRequest, db, client_ip: str = "127.0.0.1") -> dict:
        now = datetime.now(timezone.utc)

        # 1. Spam Protection - Honeypot Trap
        if request.website and len(request.website.strip()) > 0:
            # Bot filled out hidden honeypot field
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Spam submission detected. Request blocked."
            )

        # 2. Spam Protection - Math Captcha Validation (if supplied)
        if request.captcha_expected is not None and request.captcha_answer is not None:
            if request.captcha_answer != request.captcha_expected:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Security math verification failed. Please try again."
                )

        # 3. Rate Limiting Check (Max 3 submissions per email/IP in 10 minutes)
        ten_mins_ago = now - timedelta(minutes=10)
        recent_count = await db["contacts"].count_documents({
            "$or": [
                {"email": request.email.lower()},
                {"client_ip": client_ip}
            ],
            "created_at": {"$gte": ten_mins_ago}
        })
        if recent_count >= 3:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many contact submissions. Please wait 10 minutes before submitting another ticket."
            )

        # 4. Generate Unique Ticket Number
        ticket_number = f"TICK-{random.randint(10000, 99999)}"

        ticket = {
            "ticket_number": ticket_number,
            "name": request.name,
            "email": request.email.lower(),
            "phone": request.phone or "",
            "subject": request.subject,
            "message": request.message,
            "status": "OPEN",
            "client_ip": client_ip,
            "created_at": now,
            "updated_at": now
        }

        result = await db["contacts"].insert_one(ticket)
        ticket["id"] = str(result.inserted_id)

        # 5. Send Confirmation Email Notification
        try:
            email_html = EmailService.build_contact_ticket_confirmation_html(
                user_name=request.name,
                ticket_number=ticket_number,
                subject=request.subject,
                message=request.message
            )
            await EmailService.send_email(
                to_email=request.email,
                subject=f"Support Ticket #{ticket_number} Received - PrepNova AI",
                html_content=email_html
            )
        except Exception as e:
            print(f"[CONTACT SERVICE] Email notification failed: {e}")

        return ticket

    @staticmethod
    async def get_ticket_status(ticket_number: str, db) -> dict:
        ticket_num_clean = ticket_number.strip().upper().replace("#", "")
        ticket = await db["contacts"].find_one({"ticket_number": ticket_num_clean})
        if not ticket:
            # Fallback search by ID if valid ObjectId
            from bson import ObjectId
            if len(ticket_num_clean) == 24:
                try:
                    ticket = await db["contacts"].find_one({"_id": ObjectId(ticket_num_clean)})
                except Exception:
                    ticket = None

        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket #{ticket_num_clean} not found."
            )

        return {
            "ticket_number": ticket.get("ticket_number", ticket_num_clean),
            "status": ticket.get("status", "OPEN"),
            "name": ticket.get("name", "User"),
            "email": ticket.get("email", ""),
            "subject": ticket.get("subject", "General Inquiry"),
            "created_at": ticket.get("created_at", datetime.now(timezone.utc)),
            "estimated_response": "Within 24 Hours"
        }
