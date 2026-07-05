import pytest
from app.ai.interview_generator import InterviewGenerator
from app.ai.interview_evaluator import InterviewEvaluator

@pytest.mark.asyncio
async def test_interview_question_generation():
    questions = await InterviewGenerator.generate_questions("Backend Engineer", "technical", count=2)
    assert len(questions) > 0
    assert "text" in questions[0]

@pytest.mark.asyncio
async def test_interview_answer_evaluation():
    evaluation = await InterviewEvaluator.evaluate_answer(
        "Explain inheritance in OOP.",
        "Inheritance allows a class to inherit attributes and methods from another class."
    )
    assert "score" in evaluation
    assert evaluation["score"] > 0
