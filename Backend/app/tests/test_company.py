import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.company_service import CompanyService

def test_company_service_default_fallback():
    async def run():
        mock_db = MagicMock()
        mock_db["companies"].find_one = AsyncMock(return_value=None)

        comp = await CompanyService.get_company_by_slug("google", mock_db)
        assert comp is not None
        assert comp["name"] == "Google"
        assert "eligibility" in comp
        assert "hiring_process" in comp
        assert "personalized_prep_plan" in comp

    asyncio.run(run())

def test_company_service_questions():
    async def run():
        mock_db = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[
            {"_id": "q1", "company_slug": "google", "category": "dsa", "title": "LRU Cache"}
        ])
        mock_db["company_questions"].find = MagicMock(return_value=mock_cursor)

        questions = await CompanyService.get_company_questions("google", "dsa", mock_db)
        assert len(questions) == 1
        assert questions[0]["title"] == "LRU Cache"

    asyncio.run(run())

def test_company_service_admin_crud():
    async def run():
        mock_db = MagicMock()
        mock_db["companies"].find_one = AsyncMock(return_value=None)
        mock_db["companies"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="comp123"))

        company = await CompanyService.save_or_update_company({"name": "Tesla", "industry": "Automotive"}, mock_db)
        assert company["slug"] == "tesla"
        assert company["id"] == "comp123"

        mock_db["companies"].delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))
        res = await CompanyService.delete_company("comp123", mock_db)
        assert res["message"] == "Company deleted successfully"

    asyncio.run(run())

