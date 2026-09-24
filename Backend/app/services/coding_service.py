from bson import ObjectId
from datetime import datetime, timezone, date, timedelta
from fastapi import HTTPException
from app.utils.code_sandbox import CodeSandbox
from app.ai.coding_evaluator import CodingEvaluator

# Curated daily challenge pool — rotates daily by day-of-year index
DAILY_CHALLENGE_POOL = [
    {
        "slug": "two-sum",
        "title": "Two Sum",
        "difficulty": "Easy",
        "category": "Array",
        "xp_reward": 30,
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "instructions": "Return exactly two indices (0-based) such that nums[i] + nums[j] == target. Each input has exactly one solution.",
        "public_test_cases": [
            {"input": "2, 7, 11, 15\n9", "expected_output": "[0, 1]"},
            {"input": "3, 2, 4\n6", "expected_output": "[1, 2]"}
        ],
    },
    {
        "slug": "binary-search",
        "title": "Binary Search",
        "difficulty": "Easy",
        "category": "Array",
        "xp_reward": 30,
        "description": "Given a sorted array of integers and a target value k, return its index using O(log N) runtime.",
        "instructions": "Implement binary search. Return -1 if target not found.",
        "public_test_cases": [
            {"input": "1, 3, 5, 7, 9\n5", "expected_output": "2"},
            {"input": "2, 4, 6, 8\n3", "expected_output": "-1"}
        ],
    },
    {
        "slug": "reverse-linked-list",
        "title": "Reverse a Linked List",
        "difficulty": "Easy",
        "category": "Linked Lists",
        "xp_reward": 40,
        "description": "Reverse a singly linked list iteratively or recursively.",
        "instructions": "Given the head of a linked list, return the reversed list head.",
        "public_test_cases": [],
    },
    {
        "slug": "valid-parentheses",
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "category": "Stack",
        "xp_reward": 35,
        "description": "Given a string s containing '(', ')', '{', '}', '[', ']', determine if the input string is valid.",
        "instructions": "An input string is valid if every open bracket is closed in the correct order.",
        "public_test_cases": [
            {"input": "()", "expected_output": "True"},
            {"input": "()[]{}", "expected_output": "True"},
            {"input": "(]", "expected_output": "False"}
        ],
    },
    {
        "slug": "max-subarray",
        "title": "Maximum Subarray (Kadane's)",
        "difficulty": "Medium",
        "category": "Dynamic Programming",
        "xp_reward": 60,
        "description": "Given an integer array nums, find the contiguous subarray which has the largest sum.",
        "instructions": "Use Kadane's Algorithm. Return the maximum subarray sum (an integer).",
        "public_test_cases": [
            {"input": "-2, 1, -3, 4, -1, 2, 1, -5, 4", "expected_output": "6"},
            {"input": "1", "expected_output": "1"}
        ],
    },
    {
        "slug": "climbing-stairs",
        "title": "Climbing Stairs",
        "difficulty": "Easy",
        "category": "Dynamic Programming",
        "xp_reward": 35,
        "description": "You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "instructions": "Return the count of distinct ways to climb n steps. This follows the Fibonacci pattern.",
        "public_test_cases": [
            {"input": "2", "expected_output": "2"},
            {"input": "3", "expected_output": "3"}
        ],
    },
    {
        "slug": "merge-two-sorted-lists",
        "title": "Merge Two Sorted Lists",
        "difficulty": "Easy",
        "category": "Linked Lists",
        "xp_reward": 40,
        "description": "Merge two sorted linked lists and return it as a single sorted list.",
        "instructions": "Iterate both lists and build a merged sorted result list.",
        "public_test_cases": [],
    },
]


class CodingService:
    @staticmethod
    async def get_all_problems(db) -> list:
        cursor = db["coding_problems"].find({})
        problems = await cursor.to_list(length=500)
        for problem in problems:
            mongo_id = str(problem["_id"])
            problem["id"] = mongo_id
            problem["_id"] = mongo_id  # expose as string so frontend JSON can match
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

        # 3. Calculate Runtime & Memory Percentile relative to past submissions
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

        all_problems = await CodingService.get_all_problems(db)
        prob_map = {str(p["id"]): p for p in all_problems}

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
        return result

    @staticmethod
    async def delete_user_submission(user_id: str, submission_id: str, db) -> bool:
        query = {"user_id": str(user_id)}
        try:
            query["_id"] = ObjectId(submission_id)
        except Exception:
            query["_id"] = submission_id
        res = await db["coding_submissions"].delete_one(query)
        return res.deleted_count > 0

    @staticmethod
    async def clear_all_user_submissions(user_id: str, db) -> int:
        res = await db["coding_submissions"].delete_many({"user_id": str(user_id)})
        return res.deleted_count

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

    # ── Leaderboard ───────────────────────────────────────────────────────────

    @staticmethod
    async def get_leaderboard(db, limit: int = 10) -> list:
        """
        Aggregates top users by unique problems solved (primary) and XP (secondary).
        Enriches each entry with the user's display name and current streak.
        """
        pipeline = [
            {"$match": {"status": "accepted"}},
            {"$group": {
                "_id": "$user_id",
                "solved_problems": {"$addToSet": "$problem_id"},
                "total_submissions": {"$sum": 1}
            }},
            {"$project": {
                "user_id": "$_id",
                "problems_solved": {"$size": "$solved_problems"},
                "xp_points": {"$multiply": [{"$size": "$solved_problems"}, 50]},
                "total_submissions": 1
            }},
            {"$sort": {"problems_solved": -1, "xp_points": -1}},
            {"$limit": limit}
        ]

        leaderboard_raw = await db["coding_submissions"].aggregate(pipeline).to_list(length=limit)

        avatars = ["⚡", "🔥", "🧙‍♂️", "🌟", "🧠", "🚀", "💎", "🎯", "🏆", "⭐"]
        result = []

        for rank, entry in enumerate(leaderboard_raw, start=1):
            uid = entry.get("user_id", "")
            user_doc = None
            try:
                user_doc = await db["users"].find_one({"_id": ObjectId(uid)})
            except Exception:
                user_doc = await db["users"].find_one({"_id": uid})

            streak_doc = await db["coding_streaks"].find_one({"user_id": uid}) or {}
            streak = streak_doc.get("current_streak", 0)

            display_name = "Anonymous Coder"
            if user_doc:
                display_name = (
                    user_doc.get("full_name")
                    or user_doc.get("name")
                    or user_doc.get("email", "Anonymous Coder").split("@")[0]
                )

            result.append({
                "rank": rank,
                "user_id": uid,
                "name": display_name,
                "solved": entry.get("problems_solved", 0),
                "xp": entry.get("xp_points", 0),
                "streak": streak,
                "avatar": avatars[(rank - 1) % len(avatars)]
            })

        return result

    # ── Daily Challenge ───────────────────────────────────────────────────────

    @staticmethod
    async def get_daily_challenge() -> dict:
        """
        Returns today's challenge from DAILY_CHALLENGE_POOL.
        Rotates deterministically by (today.toordinal() % pool_size).
        """
        today = date.today()
        day_index = today.toordinal() % len(DAILY_CHALLENGE_POOL)
        challenge = DAILY_CHALLENGE_POOL[day_index].copy()
        challenge["date"] = today.isoformat()
        challenge["challenge_id"] = f"daily-{today.isoformat()}-{challenge['slug']}"
        return challenge

    # ── Streak Tracking ───────────────────────────────────────────────────────

    @staticmethod
    async def get_user_streak(user_id: str, db) -> dict:
        """
        Returns the user's current streak, longest streak, and today's completion status.
        """
        streak_doc = await db["coding_streaks"].find_one({"user_id": user_id})
        if not streak_doc:
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "today_completed": False,
                "last_completed_date": None,
                "total_days_practiced": 0
            }

        today = date.today().isoformat()
        last_date = streak_doc.get("last_completed_date", "")
        today_completed = (last_date == today)

        return {
            "current_streak": streak_doc.get("current_streak", 0),
            "longest_streak": streak_doc.get("longest_streak", 0),
            "today_completed": today_completed,
            "last_completed_date": last_date,
            "total_days_practiced": streak_doc.get("total_days_practiced", 0)
        }

    @staticmethod
    async def complete_daily_challenge(user_id: str, challenge_slug: str, db) -> dict:
        """
        Marks today's daily challenge as completed for the user.
        Increments or resets the streak based on whether yesterday was also completed.
        Prevents double-counting the same calendar day.
        """
        today = date.today().isoformat()
        yesterday = (date.today() - timedelta(days=1)).isoformat()

        streak_doc = await db["coding_streaks"].find_one({"user_id": user_id})

        if streak_doc:
            last_date = streak_doc.get("last_completed_date", "")

            if last_date == today:
                return {
                    "current_streak": streak_doc.get("current_streak", 0),
                    "longest_streak": streak_doc.get("longest_streak", 0),
                    "today_completed": True,
                    "message": "Already completed today's challenge! 🔥"
                }

            new_streak = streak_doc.get("current_streak", 0) + 1 if last_date == yesterday else 1
            new_longest = max(streak_doc.get("longest_streak", 0), new_streak)
            new_total = streak_doc.get("total_days_practiced", 0) + 1

            await db["coding_streaks"].update_one(
                {"user_id": user_id},
                {"$set": {
                    "current_streak": new_streak,
                    "longest_streak": new_longest,
                    "last_completed_date": today,
                    "total_days_practiced": new_total,
                    "last_challenge_slug": challenge_slug,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
        else:
            new_streak = 1
            new_longest = 1
            new_total = 1
            await db["coding_streaks"].insert_one({
                "user_id": user_id,
                "current_streak": new_streak,
                "longest_streak": new_longest,
                "last_completed_date": today,
                "total_days_practiced": new_total,
                "last_challenge_slug": challenge_slug,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })

        return {
            "current_streak": new_streak,
            "longest_streak": new_longest,
            "today_completed": True,
            "message": f"🔥 Day {new_streak} streak! Great work!"
        }
