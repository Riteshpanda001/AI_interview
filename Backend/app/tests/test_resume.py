import pytest
from app.ai.resume_parser import ResumeParser
from app.services.resume_service import ResumeService

@pytest.mark.asyncio
async def test_resume_parser_fallback():
    parsed = await ResumeParser.parse_resume("fake_resume_path.pdf")
    assert "skills" in parsed
    assert "email" in parsed
    assert len(parsed["skills"]) > 0

@pytest.mark.asyncio
async def test_resume_optimizer():
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
    # The summary or experience should be updated or kept intact
    assert len(optimized["skills"]) == 1

