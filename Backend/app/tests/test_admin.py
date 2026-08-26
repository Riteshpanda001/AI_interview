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

def test_serialize_doc_with_objectid():
    from bson import ObjectId
    oid = ObjectId()
    doc = {
        "_id": oid,
        "name": "Test",
        "nested": {"ref_id": ObjectId()},
        "list_ids": [ObjectId()]
    }
    serialized = AdminService._serialize_doc(doc)
    assert isinstance(serialized["_id"], str)
    assert serialized["id"] == str(oid)
    assert isinstance(serialized["nested"]["ref_id"], str)
    assert isinstance(serialized["list_ids"][0], str)

def test_get_system_stats_with_naive_datetime():
    from unittest.mock import AsyncMock, MagicMock
    from datetime import datetime

    async def run():
        users_col = MagicMock()
        users_col.count_documents = AsyncMock(return_value=10)
        resumes_col = MagicMock()
        resumes_col.count_documents = AsyncMock(return_value=5)
        ats_col = MagicMock()
        ats_col.count_documents = AsyncMock(return_value=3)
        interviews_col = MagicMock()
        interviews_col.count_documents = AsyncMock(return_value=2)
        contacts_col = MagicMock()
        contacts_col.count_documents = AsyncMock(return_value=1)

        payments_col = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[
            {"amount": 100.0, "status": "succeeded", "created_at": datetime.now()}  # Naive datetime
        ])
        payments_col.find.return_value = mock_cursor

        mock_db = {
            "users": users_col,
            "resumes": resumes_col,
            "ats_analyses": ats_col,
            "interview_sessions": interviews_col,
            "contacts": contacts_col,
            "payments": payments_col,
        }

        stats = await AdminService.get_system_stats(mock_db)
        assert stats["total_users"] == 10
        assert stats["total_revenue"] == 100.0
        assert stats["monthly_revenue"] == 100.0

    asyncio.run(run())

def test_get_resumes_list_with_objectid():
    from unittest.mock import AsyncMock, MagicMock
    from bson import ObjectId

    async def run():
        mock_db = MagicMock()
        mock_cursor = MagicMock()
        oid = ObjectId()
        mock_cursor.to_list = AsyncMock(return_value=[{"_id": oid, "title": "Software Engineer"}])
        mock_cursor.sort.return_value = mock_cursor
        mock_db["resumes"].find.return_value = mock_cursor

        resumes = await AdminService.get_resumes_list(mock_db)
        assert len(resumes) == 1
        assert isinstance(resumes[0]["_id"], str)
        assert resumes[0]["id"] == str(oid)

    asyncio.run(run())



