import asyncio
import pytest
from app.ai.ats_analyzer import ATSAnalyzer
from app.services.ats_service import ATSService
from app.utils.docx_exporter import DOCXExporter

def test_ats_analyzer():
    async def run():
        resume = "Experienced software engineer specializing in Python, FastAPI, React, Docker, and AWS."
        job_desc = "Looking for a Senior Software Engineer with expertise in Python, FastAPI, React, Docker, and AWS."
        analysis = await ATSAnalyzer.analyze(resume, job_desc)
        
        assert "score" in analysis
        assert analysis["score"] >= 0 and analysis["score"] <= 100
        assert "category_breakdown" in analysis
        
        breakdown = analysis["category_breakdown"]
        assert "skills_match" in breakdown
        assert "keyword_match" in breakdown
        assert "experience_match" in breakdown
        assert "projects_match" in breakdown
        assert "education" in breakdown
        assert "resume_structure" in breakdown
        assert "job_relevance" in breakdown

        # Verify exact sum of 7 components equals overall score
        total_sum = sum(cat["score"] for cat in breakdown.values())
        assert total_sum == analysis["score"]

    asyncio.run(run())

def test_deterministic_7_category_score_breakdown():
    resume_text = "Jane Doe | jane@example.com | Senior Software Engineer with 6+ years experience in Python, FastAPI, React, AWS, Docker."
    job_desc = "Required Skills: Python, FastAPI, React, AWS, Docker. Seniority: Mid Level."
    resume_data = {
        "personal": {"name": "Jane Doe", "email": "jane@example.com"},
        "summary": "Senior Engineer with 6+ years in Python, FastAPI.",
        "skills": ["Python", "FastAPI", "React", "AWS", "Docker"],
        "experience": [{"company": "Tech Corp", "role": "Senior Developer", "details": "Architected microservices boosting speed by 35%."}],
        "projects": [{"name": "Cloud App", "description": "Built using React and FastAPI."}],
        "education": [{"degree": "B.S. Computer Science"}]
    }

    res = ATSAnalyzer.compute_deterministic_score(
        resume_text=resume_text,
        job_description=job_desc,
        job_title="Senior Software Engineer",
        experience_level="Mid Level",
        resume_data=resume_data
    )

    breakdown = res["category_breakdown"]
    assert breakdown["skills_match"]["max"] == 25
    assert breakdown["keyword_match"]["max"] == 20
    assert breakdown["experience_match"]["max"] == 15
    assert breakdown["projects_match"]["max"] == 10
    assert breakdown["education"]["max"] == 10
    assert breakdown["resume_structure"]["max"] == 10
    assert breakdown["job_relevance"]["max"] == 10

    expected_sum = (
        breakdown["skills_match"]["score"] +
        breakdown["keyword_match"]["score"] +
        breakdown["experience_match"]["score"] +
        breakdown["projects_match"]["score"] +
        breakdown["education"]["score"] +
        breakdown["resume_structure"]["score"] +
        breakdown["job_relevance"]["score"]
    )
    assert res["score"] == expected_sum

def test_real_ats_score_calculation():
    resume_data = {
        "personal": {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "phone": "+1 555 123 4567",
            "linkedin": "linkedin.com/in/janedoe"
        },
        "summary": "Results-driven Senior Software Engineer with 6+ years experience architecting cloud backend systems.",
        "skills": ["Python", "FastAPI", "React", "Docker", "AWS", "PostgreSQL", "REST APIs"],
        "experience": [
            {
                "company": "Tech Corp",
                "role": "Senior Engineer",
                "duration": "2021 - Present",
                "details": "Architected microservices that boosted transaction throughput by 45% and reduced latency by 30%."
            }
        ],
        "education": [
            {
                "degree": "B.S. Computer Science",
                "institution": "Tech University"
            }
        ],
        "projects": [
            {
                "name": "Cloud Platform",
                "description": "Deployed cloud containerization system for 50k+ daily users."
            }
        ]
    }
    
    result = ATSService.calculate_real_ats_score(resume_data)
    assert "ats_score" in result
    assert result["ats_score"] > 60 and result["ats_score"] <= 100
    assert "breakdown" in result

def test_docx_export_generation():
    resume_data = {
        "personal": {"name": "Test Candidate", "role": "Full Stack Engineer", "email": "test@example.com"},
        "summary": "High-performing engineer building modern web apps.",
        "skills": ["JavaScript", "React", "Python"],
        "experience": [{"company": "Acme", "role": "Dev", "details": "Built apps."}]
    }
    docx_bytes = DOCXExporter.generate_docx(resume_data, "Test_Resume")
    assert isinstance(docx_bytes, bytes)
    assert len(docx_bytes) > 100

def test_ats_history_tracking():
    async def run():
        from app.database import MockDatabase
        db = MockDatabase()
        
        # Clear any past test records for user_id
        user_id = "test-user-ats-history-99"
        await db["ats_analyses"].delete_many({"user_id": user_id})

        # Insert multiple fake analyses for test user
        await ATSService.analyze_ats_score(
            user_id=user_id,
            resume_id="res-1",
            job_description="Python SDE",
            db=db,
            resume_text="Skills: Python, FastAPI",
            job_title="Software Engineer"
        )
        
        await ATSService.analyze_ats_score(
            user_id=user_id,
            resume_id="res-1",
            job_description="React SDE",
            db=db,
            resume_text="Skills: React, JavaScript",
            job_title="Frontend Engineer"
        )
        
        # Query mock database
        history = await db["ats_analyses"].find({"user_id": user_id}).to_list(length=100)
        assert len(history) == 2
        assert history[0]["score"] > 0
        assert history[1]["score"] > 0
        assert history[0]["created_at"] is not None

    asyncio.run(run())

