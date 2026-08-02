from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException
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
            
        # Run AI evaluator code analyzer
        evaluation = await CodingEvaluator.evaluate(
            problem_description=problem.get("description", ""),
            submitted_code=submitted_code,
            language=language
        )
        
        submission_record = {
            "user_id": user_id,
            "problem_id": problem_id,
            "language": language,
            "submitted_code": submitted_code,
            "status": "accepted" if evaluation.get("is_correct", True) else "wrong_answer",
            "run_time_ms": evaluation.get("runtime_ms", 120),
            "evaluation_result": evaluation,
            "created_at": datetime.now(timezone.utc)
        }
        
        result = await db["coding_submissions"].insert_one(submission_record)
        submission_record["id"] = str(result.inserted_id)
        
        return submission_record
