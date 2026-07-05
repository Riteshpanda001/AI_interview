import pytest
from app.ai.resume_parser import ResumeParser

@pytest.mark.asyncio
async def test_resume_parser_fallback():
    parsed = await ResumeParser.parse_resume("fake_resume_path.pdf")
    assert "skills" in parsed
    assert "email" in parsed
    assert len(parsed["skills"]) > 0
