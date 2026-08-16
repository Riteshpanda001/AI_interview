import asyncio
import pytest
from app.services.admin_service import AdminService

def test_admin_audit_log():
    from unittest.mock import AsyncMock, MagicMock

    async def run():
        mock_db = MagicMock()
        mock_db["admin_audit_logs"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="log_123"))
        
        await AdminService.log_admin_action(
            admin_id="admin_1",
            admin_email="arjun@prepnova.ai",
            action_type="USER_ROLE_UPDATE",
            target="user_456",
            details="Updated user role to admin",
            db=mock_db
        )
        assert mock_db["admin_audit_logs"].insert_one.called

    asyncio.run(run())

def test_admin_llm_usage_tracker():
    from unittest.mock import AsyncMock, MagicMock

    async def run():
        mock_db = MagicMock()
        mock_db["interview_sessions"].count_documents = AsyncMock(return_value=25)
        mock_db["ats_analyses"].count_documents = AsyncMock(return_value=40)

        usage = await AdminService.get_llm_token_usage(mock_db)
        assert usage["total_tokens_consumed"] > 0
        assert usage["gemini_tokens"] > 0
        assert usage["openai_tokens"] > 0
        assert usage["estimated_cost_usd"] > 0.0

    asyncio.run(run())

def test_get_audit_logs():
    from unittest.mock import AsyncMock, MagicMock

    async def run():
        mock_db = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[
            {"_id": "l1", "admin_email": "admin@prepnova.ai", "action_type": "PLAN_GRANT", "target": "user_1", "details": "Granted Pro Plan"}
        ])
        mock_cursor.sort.return_value = mock_cursor
        mock_db["admin_audit_logs"].find.return_value = mock_cursor

        logs = await AdminService.get_audit_logs(mock_db)
        assert len(logs) == 1
        assert logs[0]["action_type"] == "PLAN_GRANT"

    asyncio.run(run())


