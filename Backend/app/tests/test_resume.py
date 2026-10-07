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
        assert "section_order" in encoded
        assert "hidden_sections" in encoded

    asyncio.run(run())

def test_section_order_persistence_and_restore():
    from unittest.mock import AsyncMock, MagicMock
    from bson import ObjectId

    async def run():
        mock_db = MagicMock()
        resume_id = "507f1f77bcf86cd799439011"
        version_id = "507f1f77bcf86cd799439022"
        custom_order = ["summary", "skills", "experience", "education", "projects", "certifications", "personal"]
        hidden_secs = ["certifications"]

        mock_resume = {
            "_id": ObjectId(resume_id),
            "user_id": "test_user_id",
            "title": "Full Stack Dev",
            "selected_template": "tokyo",
            "parsed_content": {"personal": {"name": "Jane Doe"}},
            "section_order": custom_order,
            "hidden_sections": hidden_secs
        }

        mock_version = {
            "_id": ObjectId(version_id),
            "resume_id": resume_id,
            "user_id": "test_user_id",
            "title": "Full Stack Dev Classic",
            "version_name": "v1.0",
            "resume_data": {"personal": {"name": "Jane Doe v1"}},
            "selected_template": "classic",
            "section_order": ["personal", "summary", "skills"],
            "hidden_sections": []
        }

        mock_db["resumes"].find_one = AsyncMock(return_value=mock_resume)
        mock_db["resumes"].update_one = AsyncMock(return_value=MagicMock(matched_count=1))
        mock_db["resume_versions"].find_one = AsyncMock(return_value=mock_version)
        mock_db["resume_versions"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="ver_123"))

        # Test restore_version
        restored = await ResumeService.restore_version(resume_id, version_id, "test_user_id", mock_db)
        assert restored is not None
        assert restored["selected_template"] == "classic"
        assert restored["section_order"] == ["personal", "summary", "skills"]
        assert restored["hidden_sections"] == []

    asyncio.run(run())

def test_cover_letter_generation_service():
    from app.services.ai_service import AIService

    async def run():
        resume_data = {
            "personal": {"name": "Alex Smith", "email": "alex@example.com"},
            "summary": "Full stack engineer with 5 years experience.",
            "skills": ["React", "FastAPI", "MongoDB"],
            "experience": [{"company": "Tech Corp", "role": "Senior Dev", "details": "Built web apps"}]
        }
        res = await AIService.generate_cover_letter(
            resume_data=resume_data,
            target_role="Lead Software Engineer",
            company="Acme Corp",
            job_description="Looking for a Python/React lead.",
            tone="Confident"
        )
        assert "cover_letter" in res
        assert len(res["cover_letter"]) > 50
        assert "Alex Smith" in res["cover_letter"] or "Hiring Manager" in res["cover_letter"]

    asyncio.run(run())

def test_interview_prep_tips_service():
    from app.services.ai_service import AIService

    async def run():
        resume_data = {
            "personal": {"name": "Sam Taylor"},
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "experience": [{"company": "Cloud Inc", "role": "Backend Dev", "details": "Designed microservices"}]
        }
        res = await AIService.generate_interview_prep_tips(
            resume_data=resume_data,
            target_role="Backend Engineer",
            company="Stripe",
            job_description="Seeking scalable API engineers.",
            interview_type="Technical",
            difficulty="Hard"
        )
        assert "likely_questions" in res
        assert len(res["likely_questions"]) >= 3
        assert "technical_topics" in res
        assert len(res["technical_topics"]) >= 3
        assert "resume_based_questions" in res
        assert "recommended_preparation" in res

    asyncio.run(run())

