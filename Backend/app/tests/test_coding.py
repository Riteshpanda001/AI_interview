import asyncio
import pytest
from app.utils.code_sandbox import CodeSandbox
from app.ai.coding_evaluator import CodingEvaluator

def test_code_sandbox_execution():
    async def run():
        code = "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in seen:\n                return [seen[diff], i]\n            seen[n] = i\n        return []"

        public_tests = [{"input": "[2, 7, 11, 15]\n9", "expected_output": "[0, 1]"}]
        hidden_tests = [{"input": "[3, 2, 4]\n6", "expected_output": "[1, 2]"}]

        res = await CodeSandbox.run_test_cases(code, "python", public_tests, hidden_tests)
        
        assert res["status"] == "ACCEPTED"
        assert res["passed_count"] == 2
        assert res["total_count"] == 2
        assert res["avg_runtime_ms"] >= 0

    asyncio.run(run())

def test_coding_evaluator_with_sandbox():
    async def run():
        problem = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
        code = "class Solution:\n    def twoSum(self, nums, target):\n        m = {}\n        for i, n in enumerate(nums):\n            if target - n in m:\n                return [m[target - n], i]\n            m[n] = i\n        return []"
        
        sandbox_res = {
            "status": "ACCEPTED",
            "passed_count": 4,
            "total_count": 4,
            "avg_runtime_ms": 25,
            "error_details": ""
        }

        evaluation = await CodingEvaluator.evaluate(problem, code, "python", sandbox_res)
        assert evaluation["is_correct"] is True
        assert evaluation["status"] == "ACCEPTED"
        assert "time_complexity" in evaluation
        assert "space_complexity" in evaluation
        assert "code_quality_score" in evaluation

    asyncio.run(run())
