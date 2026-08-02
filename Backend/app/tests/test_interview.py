import asyncio
import pytest
from app.ai.interview_generator import InterviewGenerator
from app.ai.interview_evaluator import InterviewEvaluator

def test_interview_question_generation():
    async def run():
        questions = await InterviewGenerator.generate_questions("Backend Engineer", "technical", count=2)
        assert len(questions) > 0
        assert "text" in questions[0]

    asyncio.run(run())

def test_interview_categories_generation():
    async def run():
        # Technical AI-ML Engineer
        tech_q = await InterviewGenerator.generate_questions("AI-ML Engineer", "technical", count=3)
        assert len(tech_q) == 3
        assert tech_q[0]["type"] == "technical"
        assert len(tech_q[0]["text"]) > 10

        # Behavioral AI-ML Engineer
        beh_q = await InterviewGenerator.generate_questions("AI-ML Engineer", "behavioral", count=3)
        assert len(beh_q) == 3
        assert beh_q[0]["type"] == "behavioral"

        # HR & Fit AI-ML Engineer
        hr_q = await InterviewGenerator.generate_questions("AI-ML Engineer", "hr", count=3)
        assert len(hr_q) == 3
        assert hr_q[0]["type"] == "hr"

    asyncio.run(run())

def test_interview_answer_evaluation():
    async def run():
        evaluation = await InterviewEvaluator.evaluate_answer(
            "Explain inheritance in OOP.",
            "Inheritance allows a class to inherit attributes and methods from another class."
        )
        assert "score" in evaluation
        assert evaluation["score"] > 0

    asyncio.run(run())

