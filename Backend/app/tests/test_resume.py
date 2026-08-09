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

def test_job_matcher_workflow():
    async def run():
        resume_data = {
            "personal": {"name": "Alex Vance", "role": "Senior Developer"},
            "summary": "Senior Developer with React and Python experience.",
            "skills": ["React", "JavaScript", "Python", "FastAPI"],
            "experience": [{"company": "Acme", "role": "Dev", "details": "Built APIs."}]
        }
        job_desc = "Looking for Senior Developer with React, Python, Docker, Kubernetes, and AWS experience."
        
        match = await ResumeService.calculate_job_match("res_1", resume_data, job_desc, "Senior Developer")
        
        assert "match_percentage" in match
        assert match["match_percentage"] > 50
        assert "skills_match_score" in match
        assert "learning_roadmap" in match
        assert len(match["learning_roadmap"]) == 4
        assert "recommended_projects" in match
        assert "recommended_certifications" in match
        assert "mock_interview_questions" in match
        assert "tailored_resume_preview" in match

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
        
        encoded = jsonable_encoder(result)
        assert encoded["id"] == "65a123456789abcdef012345"
        assert encoded["_id"] == "65a123456789abcdef012345"

    asyncio.run(run())
