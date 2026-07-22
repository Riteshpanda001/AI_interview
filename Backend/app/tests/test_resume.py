import asyncio
import pytest
from app.ai.resume_parser import ResumeParser
from app.services.resume_service import ResumeService

def test_resume_parser_fallback():
    async def run():
        parsed = await ResumeParser.parse_resume("fake_resume_path.pdf")
        assert "skills" in parsed
        assert "email" in parsed
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
        assert len(optimized["skills"]) == 1

    asyncio.run(run())
