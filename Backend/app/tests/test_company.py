import asyncio
import pytest
from app.services.company_service import CompanyService

def test_company_profile_fallback():
    async def run():
        mock_db = MagicMock()
        mock_db["companies"].find_one = AsyncMock(return_value=None)
        profile = await CompanyService.get_company_by_slug("google", mock_db)
        assert profile["name"] == "Google"
        assert "hiring_process" in profile
        assert len(profile["hiring_process"]) == 4

    from unittest.mock import AsyncMock, MagicMock
    asyncio.run(run())

def test_company_role_filtering():
    from unittest.mock import AsyncMock, MagicMock
    async def run():
        mock_db = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[
            {"_id": "1", "title": "React Render Opt", "role_target": "Frontend Engineer"},
            {"_id": "2", "title": "SQL Indexing", "role_target": "Backend SDE-1"}
        ])
        mock_db["company_questions"].find = MagicMock(return_value=mock_cursor)

        frontend_qs = await CompanyService.get_company_questions("google", "all", mock_db, role="Frontend Engineer")
        assert len(frontend_qs) == 1
        assert frontend_qs[0]["title"] == "React Render Opt"

    asyncio.run(run())

def test_company_progress_and_tips():
    from unittest.mock import AsyncMock, MagicMock
    async def run():
        mock_db = MagicMock()
        mock_db["user_company_progress"].find_one = AsyncMock(return_value={
            "completed_question_ids": ["q1", "q2"]
        })
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[{"_id": f"q{i}"} for i in range(10)])
        mock_cursor.sort.return_value = mock_cursor
        mock_db["company_questions"].find.return_value = mock_cursor

        progress = await CompanyService.get_user_company_progress("user_1", "google", mock_db)
        assert progress["completed_count"] == 2

        mock_db["company_interview_tips"].find.return_value = mock_cursor
        tips = await CompanyService.get_company_tips("google", mock_db)
        assert len(tips) > 0

    asyncio.run(run())

