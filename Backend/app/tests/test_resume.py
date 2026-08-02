import asyncio
import pytest
from app.ai.resume_parser import ResumeParser
from app.services.resume_service import ResumeService

def test_resume_parser_fallback():
    async def run():
        parsed = await ResumeParser.parse_resume("fake_resume_path.pdf")
        assert "skills" in parsed
        assert "personal" in parsed
        assert "email" in parsed["personal"]
        assert len(parsed["skills"]) > 0

    asyncio.run(run())

def test_resume_optimizer():
    async def run():
        test_data = {
            "personal": {
                "name": "Test User",
                "role": "QA Engineer"
            },
            "summary": "Experienced QA",
            "experience": [
                {
                    "company": "Test Co",
                    "role": "QA",
                    "details": "Tested applications manually."
                }
            ],
            "education": [],
            "skills": ["Manual Testing"],
            "projects": []
        }
        optimized = await ResumeService.optimize_resume(test_data)
        assert optimized["personal"]["name"] == "Test User"
        assert "skills" in optimized
        assert len(optimized["skills"]) >= 1

    asyncio.run(run())

def test_save_or_update_resume_serialization():
    from fastapi.encoders import jsonable_encoder
    from unittest.mock import AsyncMock, MagicMock

    async def run():
        mock_db = MagicMock()
        mock_db["resumes"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="65a123456789abcdef012345"))
        
        save_data = {
            "title": "New Resume",
            "selected_template": "london",
            "resume_data": {"summary": "Test Summary"}
        }
        result = await ResumeService.save_or_update_resume("test_user_id", save_data, mock_db)
        
        # Verify jsonable_encoder succeeds without raising TypeError/ValueError for ObjectId
        encoded = jsonable_encoder(result)
        assert encoded["id"] == "65a123456789abcdef012345"
        assert encoded["_id"] == "65a123456789abcdef012345"

    asyncio.run(run())

