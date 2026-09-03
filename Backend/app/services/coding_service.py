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
        
        current_status = status_map.get(sandbox_res.get("status"), "wrong_answer")
        run_time_ms = sandbox_res.get("avg_runtime_ms", evaluation.get("runtime_ms", 25))
        avg_memory_kb = sandbox_res.get("avg_memory_kb", 4200)

        # 3. Calculate Runtime & Memory Percentile performance relative to past submissions
        past_cursor = db["coding_submissions"].find({"problem_id": problem_id, "status": "accepted"})
        past_submissions = await past_cursor.to_list(length=200)
        
        if past_submissions and current_status == "accepted":
            faster_than = sum(1 for s in past_submissions if s.get("run_time_ms", 100) >= run_time_ms)
            runtime_pct = round(min(99.0, max(15.0, (faster_than / max(1, len(past_submissions))) * 100.0)), 1)
            mem_pct = round(min(98.5, max(20.0, 75.0 + (5000 - avg_memory_kb) / 200.0)), 1)
        else:
            runtime_pct = 92.4 if current_status == "accepted" else 0.0
            mem_pct = 88.5 if current_status == "accepted" else 0.0

        all_tc_results = sandbox_res.get("all_results") or sandbox_res.get("public_results") or []

        # Update evaluation result dictionary
        evaluation["runtime_percentile"] = runtime_pct
        evaluation["memory_percentile"] = mem_pct
        evaluation["avg_memory_kb"] = avg_memory_kb
        evaluation["test_case_results"] = all_tc_results
        evaluation["all_results"] = all_tc_results

        submission_record = {
            "user_id": user_id,
            "problem_id": problem_id,
            "language": language,
            "submitted_code": submitted_code,
            "status": current_status,
            "run_time_ms": run_time_ms,
            "runtime_percentile": runtime_pct,
            "memory_percentile": mem_pct,
            "evaluation_result": evaluation,
            "test_case_results": all_tc_results,
            "created_at": datetime.now(timezone.utc)
        }
        
        result = await db["coding_submissions"].insert_one(submission_record)
        submission_record["_id"] = str(result.inserted_id)
        submission_record["id"] = str(result.inserted_id)
        
        try:
            from app.services.activity_service import ActivityService
            prob_title = problem.get("title", f"Problem #{problem_id[:6]}")
            act_type = "CODING_SOLVED" if current_status == "accepted" else "CODING_ATTEMPTED"
            act_title = f"💻 Solved {prob_title}" if current_status == "accepted" else f"💻 Attempted {prob_title}"
            await ActivityService.log_activity(
                user_id=user_id,
                activity_type=act_type,
                title=act_title,
                description=f"Language: {language.upper()} | Verdict: {current_status.replace('_', ' ').title()}",
                metadata={"problem_id": problem_id, "status": current_status, "language": language},
                db=db
            )
        except Exception as ce:
            print(f"Error logging coding activity: {ce}")

        return submission_record

    @staticmethod
    async def get_user_submission_history(user_id: str, problem_id: str, db) -> list:
        cursor = db["coding_submissions"].find({
            "user_id": user_id,
            "problem_id": problem_id
        }).sort("created_at", -1)
        
        history = []
        async for doc in cursor:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            doc["id"] = str(doc.get("_id", ""))
            history.append(doc)
        return history

    @staticmethod
    async def get_user_all_submissions(user_id: str, db) -> list:
        cursor = db["coding_submissions"].find({"user_id": str(user_id)}).sort("created_at", -1)
        subs = await cursor.to_list(length=200)

        # Map problem info
        all_problems = await CodingService.get_all_problems(db)
        prob_map = {str(p["id"]): p for p in all_problems}

        # Track attempts per problem for current user
        attempts_map = {}
        for s in reversed(subs):
            pid = str(s.get("problem_id", ""))
            attempts_map[pid] = attempts_map.get(pid, 0) + 1
            s["attempts_count"] = attempts_map[pid]

        result = []
        for doc in subs:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            doc["id"] = str(doc.get("_id", ""))
            pid = str(doc.get("problem_id", ""))
            p_info = prob_map.get(pid, {})
            doc["problem_name"] = p_info.get("title", f"Problem #{pid[:6]}")
            doc["difficulty"] = p_info.get("difficulty", "Medium")
            doc["category"] = p_info.get("category", "General")
            if "created_at" in doc and hasattr(doc["created_at"], "isoformat"):
                doc["created_at"] = doc["created_at"].isoformat()
            result.append(doc)
        return result

    @staticmethod
    async def get_user_coding_statistics(user_id: str, db) -> dict:
        subs = await CodingService.get_user_all_submissions(user_id, db)
        total_submissions = len(subs)
        accepted_subs = [s for s in subs if s.get("status") == "accepted"]
        
        unique_solved = set(s.get("problem_id") for s in accepted_subs)
        unique_attempted = set(s.get("problem_id") for s in subs)

        easy_count = sum(1 for s in accepted_subs if s.get("difficulty", "").lower() == "easy")
        medium_count = sum(1 for s in accepted_subs if s.get("difficulty", "").lower() == "medium")
        hard_count = sum(1 for s in accepted_subs if s.get("difficulty", "").lower() == "hard")

        accuracy = int(round((len(accepted_subs) / max(1, total_submissions)) * 100)) if total_submissions > 0 else 0

        # Topic Breakdown
        topics = ["Arrays", "Strings", "Linked Lists", "Trees", "Graphs", "Dynamic Programming"]
        topic_stats = {t: {"attempted": 0, "solved": 0} for t in topics}

        for s in subs:
            cat = s.get("category", "Arrays")
            matched = "Arrays"
            for t in topics:
                if t.lower() in cat.lower():
                    matched = t
                    break
            topic_stats[matched]["attempted"] += 1
            if s.get("status") == "accepted":
                topic_stats[matched]["solved"] += 1

        topic_performance = {}
        weakest = "Dynamic Programming"
        min_acc = 100.0

        for t_name, t_data in topic_stats.items():
            acc = round((t_data["solved"] / t_data["attempted"]) * 100) if t_data["attempted"] > 0 else 0
            topic_performance[t_name] = acc
            if t_data["attempted"] > 0 and acc < min_acc:
                min_acc = acc
                weakest = t_name

        return {
            "total_problems_bank": 120,
            "problems_solved": len(unique_solved),
            "problems_attempted": len(unique_attempted),
            "total_submissions": total_submissions,
            "accuracy": accuracy,
            "easy_solved": easy_count,
            "medium_solved": medium_count,
            "hard_solved": hard_count,
            "topic_performance": topic_performance,
            "weakest_topic": weakest
        }


