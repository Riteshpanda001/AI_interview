import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.admin_service import AdminService

def test_admin_service_stats():
    async def run():
        mock_db = {}
        
        mock_users = MagicMock()
        async def mock_user_count(query=None):
            if query and "plan_type" in query:
                return 20
            return 100
        mock_users.count_documents = AsyncMock(side_effect=mock_user_count)

        mock_contacts = MagicMock()
        async def mock_ticket_count(query=None):
            if query and "status" in query:
                return 3
            return 15
        mock_contacts.count_documents = AsyncMock(side_effect=mock_ticket_count)

        mock_resumes = MagicMock()
        mock_resumes.count_documents = AsyncMock(return_value=50)

        mock_ats = MagicMock()
        mock_ats.count_documents = AsyncMock(return_value=40)

        mock_interviews = MagicMock()
        mock_interviews.count_documents = AsyncMock(return_value=30)

        mock_payments = MagicMock()
        mock_payments_cursor = MagicMock()
        mock_payments_cursor.to_list = AsyncMock(return_value=[{"amount": 499.0}, {"amount": 999.0}])
        mock_payments.find = MagicMock(return_value=mock_payments_cursor)

        mock_db["users"] = mock_users
        mock_db["contacts"] = mock_contacts
        mock_db["resumes"] = mock_resumes
        mock_db["ats_analyses"] = mock_ats
        mock_db["interview_sessions"] = mock_interviews
        mock_db["payments"] = mock_payments

        stats = await AdminService.get_system_stats(mock_db)
        assert stats["total_users"] == 100
        assert stats["pro_users"] == 20
        assert stats["total_revenue"] == 1498.0
        assert stats["open_tickets"] == 3

    asyncio.run(run())

def test_admin_user_status_update():
    async def run():
        mock_db = MagicMock()
        mock_db["users"].update_one = AsyncMock(return_value=MagicMock(matched_count=1))

        res = await AdminService.update_user_status("user123", False, mock_db)
        assert "suspended" in res["message"]

        res = await AdminService.update_user_role("user123", "admin", mock_db)
        assert "admin" in res["message"]

    asyncio.run(run())

def test_admin_ticket_reply():
    async def run():
        mock_db = MagicMock()
        mock_db["contacts"].find_one = AsyncMock(return_value={
            "ticket_number": "TICK-10001",
            "name": "Jane Candidate",
            "email": "jane@example.com",
            "message": "Need help with payment"
        })
        mock_db["contacts"].update_one = AsyncMock(return_value=MagicMock(matched_count=1))

        res = await AdminService.reply_to_ticket("TICK-10001", "We have resolved your issue.", "RESOLVED", mock_db)
        assert res["status"] == "RESOLVED"
        assert "Reply recorded" in res["message"]

    asyncio.run(run())

def test_admin_system_health():
    async def run():
        mock_db = MagicMock()
        mock_db.command = AsyncMock(return_value={"ok": 1.0})

        health = await AdminService.get_system_health(mock_db)
        assert "MongoDB" in health["database_status"]
        assert "Redis" in health["cache_status"]

    asyncio.run(run())

def test_admin_system_prompts():
    async def run():
        mock_db = MagicMock()
        mock_db["system_prompts"].find_one = AsyncMock(return_value={"_id": "prompt123", "category": "ats"})
        mock_db["system_prompts"].update_one = AsyncMock(return_value=MagicMock(matched_count=1))

        res = await AdminService.save_system_prompt("New ATS Prompt", "ats", "You are an ATS analyzer.", mock_db)
        assert res["category"] == "ats"
        assert res["name"] == "New ATS Prompt"

    asyncio.run(run())

