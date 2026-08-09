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
                "education": ["B.Tech"]
            }
        })
        mock_db.__getitem__.side_effect = lambda key: {
            "resumes": mock_resumes,
            "ats_analyses": MagicMock(find_one=AsyncMock(return_value={"score": 82, "missing_skills": ["System Design", "SQL"]})),
            "interview_sessions": MagicMock(count_documents=AsyncMock(return_value=5)),
            "interview_results": MagicMock(find=MagicMock(return_value=MagicMock(to_list=AsyncMock(return_value=[{"overall_score": 85, "verdict": "Strong Hire", "created_at": "2026-08-09T10:00:00Z"}])))),
            "coding_submissions": MagicMock(find=MagicMock(return_value=MagicMock(to_list=AsyncMock(return_value=[{"status": "accepted"}, {"status": "accepted"}, {"status": "wrong_answer"}]))))
        }.get(key, MagicMock())

        data = await DashboardService.get_user_dashboard("user123", mock_db)
        assert data["ats_score"] == 88
        assert data["resume_completion"] == 100
        assert data["interview_readiness"] > 70
        assert "Java" in data["strong_skills"]
        assert len(data["ai_recommendations"]) == 3

    asyncio.run(run())
