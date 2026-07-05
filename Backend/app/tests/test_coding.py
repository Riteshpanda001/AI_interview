import pytest
from app.ai.coding_evaluator import CodingEvaluator

@pytest.mark.asyncio
async def test_coding_evaluator():
    problem = "Write a function that returns the square of a number."
    code = "def square(n):\n    return n * n"
    
    evaluation = await CodingEvaluator.evaluate(problem, code, "python")
    assert "is_correct" in evaluation
    assert evaluation["is_correct"] is True
