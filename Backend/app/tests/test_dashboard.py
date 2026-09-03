import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.dashboard_service import DashboardService

def test_dashboard_service_calculation():
    async def run():
        mock_db = MagicMock()
        mock_resumes = MagicMock()
        mock_resumes.find_one = AsyncMock(return_value={
            "ats_score": 88,
            "parsed_content": {
                "personal": {"name": "Test User"},
                "summary": "Full Stack Dev",
                "experience": ["Tech Corp"],
                "skills": ["Java", "React", "Communication", "Python"],
                "projects": ["AI Platform"],
                "education": ["B.Tech"],
                "certifications": ["AWS Certified"]
            }
        })

        mock_ats = MagicMock()
        mock_ats.find.return_value.sort.return_value.to_list = AsyncMock(return_value=[
            {"score": 88, "missing_skills": ["System Design", "SQL"]}
        ])

        mock_int_results = MagicMock()
        mock_int_results.find.return_value.sort.return_value.to_list = AsyncMock(return_value=[
            {"overall_score": 85, "verdict": "Strong Hire", "created_at": "2026-08-09T10:00:00Z"}
        ])

        mock_code_sub = MagicMock()
        mock_code_sub.find.return_value.to_list = AsyncMock(return_value=[
            {"status": "accepted", "problem_id": "p1"},
            {"status": "accepted", "problem_id": "p2"},
            {"status": "wrong_answer", "problem_id": "p3"}
        ])

        mock_code_prob = MagicMock()
        mock_code_prob.find.return_value.to_list = AsyncMock(return_value=[
            {"_id": "p1", "title": "Two Sum", "difficulty": "Easy", "category": "Arrays"},
            {"_id": "p2", "title": "3Sum", "difficulty": "Medium", "category": "Arrays"}
        ])

        mock_comp = MagicMock()
        mock_comp.find.return_value.to_list = AsyncMock(return_value=[])

        mock_act = MagicMock()
        mock_act.find.return_value.sort.return_value.limit.return_value.to_list = AsyncMock(return_value=[])

        mock_goals = MagicMock()
        mock_goals.find.return_value.sort.return_value.to_list = AsyncMock(return_value=[])

        mock_db.__getitem__.side_effect = lambda key: {
            "resumes": mock_resumes,
            "ats_analyses": mock_ats,
            "interview_sessions": MagicMock(count_documents=AsyncMock(return_value=5)),
            "interview_results": mock_int_results,
            "coding_submissions": mock_code_sub,
            "coding_problems": mock_code_prob,
            "user_company_progress": mock_comp,
            "activities": mock_act,
            "user_goals": mock_goals
        }.get(key, MagicMock())

        data = await DashboardService.get_user_dashboard("user123", mock_db)
        assert data["ats_score"] == 88
        assert data["resume_completion"] == 100
        assert data["interview_readiness"] > 50
        assert "Java" in data["strong_skills"]
        assert len(data["ai_recommendations"]) > 0

    asyncio.run(run())

