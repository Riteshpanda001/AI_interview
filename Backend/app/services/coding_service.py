from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException
from app.utils.code_sandbox import CodeSandbox
from app.ai.coding_evaluator import CodingEvaluator

class CodingService:
    @staticmethod
    async def get_all_problems(db) -> list:
        cursor = db["coding_problems"].find({})
        problems = await cursor.to_list(length=100)
        for problem in problems:
            problem["id"] = str(problem["_id"])
        return problems

    @staticmethod
    async def evaluate_submission(user_id: str, problem_id: str, language: str, submitted_code: str, db) -> dict:
        try:
            problem = await db["coding_problems"].find_one({"_id": ObjectId(problem_id)})
        except Exception:
            problem = await db["coding_problems"].find_one({"_id": problem_id})

        if not problem:
            raise HTTPException(status_code=404, detail="Coding problem not found.")
            
        public_tests = problem.get("public_test_cases", [
            {"input": "2, 7, 11, 15\n9", "expected_output": "[0, 1]"},
            {"input": "3, 2, 4\n6", "expected_output": "[1, 2]"}
        ])
        hidden_tests = problem.get("hidden_test_cases", [
            {"input": "3, 3\n6", "expected_output": "[0, 1]"}
        ])

        # 1. Run Isolated Subprocess Code Execution Sandbox
        sandbox_res = await CodeSandbox.run_test_cases(
            submitted_code=submitted_code,
            language=language,
            public_test_cases=public_tests,
            hidden_test_cases=hidden_tests
        )

        # 2. Run AI Code Reviewer for Time/Space Complexity & Optimization
        evaluation = await CodingEvaluator.evaluate(
            problem_description=problem.get("description", ""),
            submitted_code=submitted_code,
            language=language,
            sandbox_result=sandbox_res
        )
        
        status_map = {
            "ACCEPTED": "accepted",
            "WRONG_ANSWER": "wrong_answer",
            "TIME_LIMIT_EXCEEDED": "time_limit_exceeded",
            "COMPILATION_ERROR": "compilation_error",
            "RUNTIME_ERROR": "runtime_error"
        }
        
        submission_record = {
            "user_id": user_id,
            "problem_id": problem_id,
            "language": language,
            "submitted_code": submitted_code,
            "status": status_map.get(sandbox_res.get("status"), "wrong_answer"),
            "run_time_ms": evaluation.get("runtime_ms", 35),
            "evaluation_result": evaluation,
            "created_at": datetime.now(timezone.utc)
        }
        
        result = await db["coding_submissions"].insert_one(submission_record)
        submission_record["id"] = str(result.inserted_id)
        
        return submission_record
