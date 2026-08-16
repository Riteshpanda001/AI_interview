import asyncio
import pytest
from app.utils.pdf_generator import InterviewPDFGenerator
from app.services.interview_service import InterviewService

def test_interview_pdf_generator():
    session_data = {
        "id": "sess_12345678",
        "role_target": "Senior Full-Stack Engineer",
        "experience_level": "Senior",
        "interview_type": "Technical Round",
        "created_at": "2026-08-13"
    }

    feedback_data = {
        "answers_feedback": [
            {
                "question_id": "q1",
                "question_text": "Describe how you scale React application state management under high update frequencies.",
                "user_answer": "I use atomic selector stores like Zustand/Jotai and memoized components to minimize re-renders.",
                "score": 9,
                "strengths": ["Excellent state management knowledge", "Clear explanation"],
                "weaknesses": ["Mention SSR hydration trade-offs"],
                "suggested_answer": "Discuss selector memoization, batching state updates, and server components."
            }
        ],
        "overall_summary": "Demonstrated expert architectural knowledge."
    }

    pdf_bytes = InterviewPDFGenerator.generate_pdf(session_data, feedback_data)
    assert pdf_bytes is not None
    assert len(pdf_bytes) > 200
    assert pdf_bytes.startswith(b"%PDF")

def test_generate_interview_pdf_service():
    from unittest.mock import AsyncMock, MagicMock

    async def run():
        mock_db = MagicMock()
        mock_db["interview_sessions"].find_one = AsyncMock(return_value={
            "_id": "sess_999",
            "role_target": "DevOps Engineer",
            "interview_type": "System Infrastructure",
            "questions": [{"question_id": "q1", "text": "Explain Kubernetes ingress controllers."}],
            "responses": [{"question_id": "q1", "answer_text": "Ingress routes external HTTP/HTTPS traffic.", "score": 8, "feedback": {}}]
        })

        pdf_data = await InterviewService.generate_interview_pdf("sess_999", "user_123", mock_db)
        assert pdf_data is not None
        assert len(pdf_data) > 100
        assert pdf_data.startswith(b"%PDF")

    asyncio.run(run())
