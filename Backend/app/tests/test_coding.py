import asyncio
import pytest
from app.utils.code_sandbox import CodeSandbox
from app.services.coding_service import CodingService

def test_code_sandbox_python():
    async def run():
        code = """class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]"""
        pub_cases = [{"input": "2, 7, 11, 15\n9", "expected_output": "[0, 1]"}]
        res = await CodeSandbox.run_test_cases(code, "python", pub_cases, [])
        assert res["status"] in ["ACCEPTED", "SUCCESS"]
        assert res["passed_count"] == 1
        assert len(res["all_results"]) == 1

    asyncio.run(run())

def test_code_sandbox_cpp():
    async def run():
        code = """#include <vector>\nusing namespace std;\nclass Solution { public: vector<int> twoSum(vector<int>& nums, int target) { return {0, 1}; } };"""
        pub_cases = [{"input": "2, 7, 11, 15\n9", "expected_output": "[0, 1]"}]
        res = await CodeSandbox.run_test_cases(code, "cpp", pub_cases, [])
        assert "status" in res
        assert "passed_count" in res

    asyncio.run(run())

def test_evaluate_submission_percentiles():
    from unittest.mock import AsyncMock, MagicMock

    async def run():
        mock_db = MagicMock()
        mock_db["coding_problems"].find_one = AsyncMock(return_value={
            "_id": "two-sum",
            "description": "Find indices of two numbers that add to target.",
            "public_test_cases": [{"input": "2, 7, 11, 15\n9", "expected_output": "[0, 1]"}],
            "hidden_test_cases": []
        })
        
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[
            {"run_time_ms": 30, "status": "accepted"},
            {"run_time_ms": 45, "status": "accepted"}
        ])
        mock_db["coding_submissions"].find = MagicMock(return_value=mock_cursor)
        mock_db["coding_submissions"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="sub_12345"))

        sub = await CodingService.evaluate_submission("user_1", "two-sum", "python", "class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]", mock_db)

        assert sub["status"] == "accepted"
        assert "runtime_percentile" in sub
        assert "memory_percentile" in sub
        assert "test_case_results" in sub

    asyncio.run(run())
