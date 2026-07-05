import pytest
from app.ai.ats_analyzer import ATSAnalyzer

@pytest.mark.asyncio
async def test_ats_analyzer():
    resume = "Experienced software engineer specializing in Python and FastAPI."
    job_desc = "Looking for a Python Developer who knows FastAPI."
    analysis = await ATSAnalyzer.analyze(resume, job_desc)
    
    assert "score" in analysis
    assert analysis["score"] >= 0 and analysis["score"] <= 100
    assert "matched_skills" in analysis
