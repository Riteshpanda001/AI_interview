import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.services.contact_service import ContactService
from app.schemas.contact_schema import ContactCreateRequest

def test_create_ticket_success():
    async def run():
        # Setup mock db
        mock_db = MagicMock()
        mock_contacts = MagicMock()
        # Mock count_documents to return 0 (no rate limit hit)
        mock_contacts.count_documents = AsyncMock(return_value=0)
        # Mock insert_one to simulate db insertion
        mock_insert_result = MagicMock(inserted_id="contact_id_123")
        mock_contacts.insert_one = AsyncMock(return_value=mock_insert_result)
        mock_db.__getitem__.return_value = mock_contacts

        # Create valid contact request
        req = ContactCreateRequest(
            name="John Doe",
            email="johndoe@example.com",
            phone="1234567890",
            subject="ATS score question",
            message="Hi, I have a question about the ATS resume parser.",
            captcha_answer=12,
            captcha_expected=12,
            website=""
        )

        with patch("app.services.email_service.EmailService.send_email", new_callable=AsyncMock) as mock_send_email:
            ticket = await ContactService.create_ticket(req, db=mock_db, client_ip="127.0.0.1")
            
            assert ticket["name"] == "John Doe"
            assert ticket["email"] == "johndoe@example.com"
            assert ticket["phone"] == "1234567890"
            assert ticket["subject"] == "ATS score question"
            assert ticket["message"] == "Hi, I have a question about the ATS resume parser."
            assert ticket["status"] == "OPEN"
            assert ticket["id"] == "contact_id_123"
            assert ticket["ticket_number"].startswith("TICK-")
            assert mock_send_email.called

    asyncio.run(run())

def test_create_ticket_spam_honeypot():
    async def run():
        mock_db = MagicMock()
        
        # Create contact request with honeypot website filled
        req = ContactCreateRequest(
            name="Spam Bot",
            email="bot@spam.com",
            subject="Spam subject",
            message="Spam message spam spam",
            captcha_answer=5,
            captcha_expected=5,
            website="http://spamwebsite.com"
        )

        with pytest.raises(HTTPException) as exc_info:
            await ContactService.create_ticket(req, db=mock_db, client_ip="127.0.0.1")
        
        assert exc_info.value.status_code == 400
        assert "Spam submission detected" in exc_info.value.detail

    asyncio.run(run())

def test_create_ticket_captcha_failure():
    async def run():
        mock_db = MagicMock()
        
        # Create contact request with wrong captcha answer
        req = ContactCreateRequest(
            name="John Doe",
            email="johndoe@example.com",
            subject="Question",
            message="Query query query",
            captcha_answer=5,
            captcha_expected=10,
            website=""
        )

        with pytest.raises(HTTPException) as exc_info:
            await ContactService.create_ticket(req, db=mock_db, client_ip="127.0.0.1")
        
        assert exc_info.value.status_code == 400
        assert "Security math verification failed" in exc_info.value.detail

    asyncio.run(run())

def test_create_ticket_rate_limit():
    async def run():
        # Setup mock db
        mock_db = MagicMock()
        mock_contacts = MagicMock()
        # Mock count_documents to return 3 (rate limit hit)
        mock_contacts.count_documents = AsyncMock(return_value=3)
        mock_db.__getitem__.return_value = mock_contacts

        req = ContactCreateRequest(
            name="John Doe",
            email="johndoe@example.com",
            subject="Question",
            message="Query query query",
            captcha_answer=10,
            captcha_expected=10,
            website=""
        )

        with pytest.raises(HTTPException) as exc_info:
            await ContactService.create_ticket(req, db=mock_db, client_ip="127.0.0.1")
        
        assert exc_info.value.status_code == 429
        assert "Too many contact submissions" in exc_info.value.detail

    asyncio.run(run())

def test_get_ticket_status():
    async def run():
        mock_db = MagicMock()
        mock_contacts = MagicMock()
        
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        
        # Mock find_one to return the ticket dict
        mock_contacts.find_one = AsyncMock(return_value={
            "ticket_number": "TICK-98765",
            "name": "Jane Doe",
            "email": "janedoe@example.com",
            "subject": "Billing issue",
            "status": "IN_PROGRESS",
            "created_at": now
        })
        mock_db.__getitem__.return_value = mock_contacts

        status_res = await ContactService.get_ticket_status("TICK-98765", db=mock_db)
        
        assert status_res["ticket_number"] == "TICK-98765"
        assert status_res["status"] == "IN_PROGRESS"
        assert status_res["name"] == "Jane Doe"
        assert status_res["email"] == "janedoe@example.com"
        assert status_res["subject"] == "Billing issue"
        assert status_res["estimated_response"] == "Within 24 Hours"

    asyncio.run(run())
