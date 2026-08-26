from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException

class CompanyService:
    @staticmethod
    def serialize_doc(doc):
        if not doc:
            return doc
        if isinstance(doc, list):
            return [CompanyService.serialize_doc(d) for d in doc]
        if isinstance(doc, dict):
            new_doc = {}
            for k, v in doc.items():
                if k == "_id" or isinstance(v, ObjectId):
                    new_doc[k] = str(v)
                elif isinstance(v, dict):
                    new_doc[k] = CompanyService.serialize_doc(v)
                elif isinstance(v, list):
                    new_doc[k] = [CompanyService.serialize_doc(item) for item in v]
                else:
                    new_doc[k] = v
            # Ensure "id" field is populated
            if "_id" in new_doc and "id" not in new_doc:
                new_doc["id"] = new_doc["_id"]
            return new_doc
        return doc

    @staticmethod
    async def get_all_companies(db) -> list:
        cursor = db["companies"].find({})
        companies = await cursor.to_list(length=100)
        return [CompanyService.serialize_doc(comp) for comp in companies]

    @staticmethod
    async def get_company_by_slug(slug: str, db) -> dict:
        slug_clean = slug.lower().strip()
        comp = await db["companies"].find_one({"slug": slug_clean})
        if not comp:
            # Fallback to search by name or return default company structure
            comp = await db["companies"].find_one({"name": {"$regex": slug_clean, "$options": "i"}})
        
        if comp:
            return CompanyService.serialize_doc(comp)
            
        # Standard default schema fallback for unscheduled companies
        return {
            "name": slug.title(),
            "slug": slug_clean,
            "description": f"Leading enterprise organization specializing in scalable {slug.title()} systems.",
            "industry": "Technology / Software Development",
            "difficulty_rating": "Hard",
            "eligibility": {
                "degree": "B.E. / B.Tech / M.Tech / MCA in CS, IT, ECE, or related STEM fields",
                "min_cgpa": "7.0 CGPA / 65% aggregate with no active backlogs",
                "batch_eligibility": "Current graduating batch & recent graduates (0-3 years exp)",
                "backlogs_allowed": "0 active backlogs at time of interview"
            },
            "hiring_process": [
                {"stage": 1, "title": "Online Assessment (OA)", "duration": "90 Mins", "details": "2 Coding Problems (DSA) + 20 Core CS MCQs (OS, DBMS, Networks)"},
                {"stage": 2, "title": "Technical Round 1", "duration": "60 Mins", "details": "Data Structures & Algorithms, Code Dry Runs, Optimization"},
                {"stage": 3, "title": "Technical Round 2 (System Design)", "duration": "60 Mins", "details": "High-level & Low-level system design, scalability trade-offs"},
                {"stage": 4, "title": "HR & Behavioral Round", "duration": "45 Mins", "details": "Cultural alignment, STAR behavioral scenario responses, compensation"}
            ],
            "online_assessment_specs": {
                "platform": "HackerRank / Codility",
                "duration_mins": 90,
                "sections": ["Coding (2 Problems)", "Computer Science MCQs (15 Questions)"],
                "cutoff_percentage": "85%"
            },
            "personalized_prep_plan": [
                {"week": "Week 1", "focus": "Advanced DSA & Target Patterns", "tasks": ["Solve top 15 company-tagged LeetCode problems", "Master Graph & DP patterns"]},
                {"week": "Week 2", "focus": "System Design & Architecture", "tasks": ["Study load balancing, caching, microservices", "Review LLD class diagrams"]},
                {"week": "Week 3", "focus": "Core CS Fundamentals & MCQs", "tasks": ["Revise OS concurrency, DBMS indexing, TCP/IP", "Practice timed online assessment mock"]},
                {"week": "Week 4", "focus": "Behavioral STAR & Company Mock", "tasks": ["Draft STAR stories aligned to company values", "Run 1-click Company Mock Interview"]}
            ]
        }

    @staticmethod
    async def get_company_questions(slug: str, category: str, db, role: str = None) -> list:
        slug_clean = slug.lower().strip()
        query = {"company_slug": slug_clean}
        if category and category.lower() != "all":
            query["category"] = category.lower()

        cursor = db["company_questions"].find(query)
        questions = await cursor.to_list(length=100)
        
        if not questions:
            # Check general company questions array in db["companies"]
            comp = await db["companies"].find_one({"slug": slug_clean})
            if comp and "questions" in comp:
                questions = comp["questions"]

        # Serialize documents to handle ObjectId type
        serialized_questions = [CompanyService.serialize_doc(q) for q in questions]

        for q in serialized_questions:
            if "role_target" not in q:
                q["role_target"] = "All Roles"

        # Apply role-level filtering if provided
        if role and role.lower() not in ["all", "all roles"]:
            role_clean = role.lower().strip()
            filtered = [
                q for q in serialized_questions
                if role_clean in q.get("role_target", "all").lower() or "all" in q.get("role_target", "all").lower()
            ]
            return filtered if filtered else serialized_questions

        return serialized_questions

    @staticmethod
    async def get_user_company_progress(user_id: str, slug: str, db) -> dict:
        slug_clean = slug.lower().strip()
        doc = await db["user_company_progress"].find_one({"user_id": user_id, "company_slug": slug_clean})
        completed_ids = doc.get("completed_question_ids", []) if doc else []
        
        all_qs = await CompanyService.get_company_questions(slug_clean, "all", db)
        total = len(all_qs)
        completed = len(completed_ids)
        
        if total > 0:
            pct = int((completed / total) * 100)
        else:
            pct = 100  # completed all available questions if total is 0

        return {
            "company_slug": slug_clean,
            "completed_question_ids": completed_ids,
            "completed_count": completed,
            "total_count": total,
            "progress_percentage": min(100, pct)
        }


    @staticmethod
    async def toggle_question_completion(user_id: str, slug: str, question_id: str, db) -> dict:
        slug_clean = slug.lower().strip()
        doc = await db["user_company_progress"].find_one({"user_id": user_id, "company_slug": slug_clean})
        
        completed_ids = doc.get("completed_question_ids", []) if doc else []
        if question_id in completed_ids:
            completed_ids.remove(question_id)
        else:
            completed_ids.append(question_id)

        update_doc = {
            "user_id": user_id,
            "company_slug": slug_clean,
            "completed_question_ids": completed_ids,
            "updated_at": datetime.now(timezone.utc)
        }

        if doc:
            await db["user_company_progress"].update_one({"_id": doc["_id"]}, {"$set": update_doc})
        else:
            await db["user_company_progress"].insert_one(update_doc)

        return await CompanyService.get_user_company_progress(user_id, slug_clean, db)

    @staticmethod
    async def get_company_tips(slug: str, db) -> list:
        slug_clean = slug.lower().strip()
        cursor = db["company_interview_tips"].find({"company_slug": slug_clean}).sort("created_at", -1)
        tips = await cursor.to_list(length=50)

        if not tips:
            # Fallback pre-populated community tips
            tips = [
                {
                    "id": "tip-1",
                    "company_slug": slug_clean,
                    "author_name": "Rohan M. (Software Engineer)",
                    "role": "Backend SDE-1",
                    "round_name": "Technical Round 2 (System Design)",
                    "tip_content": f"Focus heavily on database indexing & caching trade-offs. The interviewer at {slug_clean.title()} asked to design an URL shortener with 10M daily active users.",
                    "difficulty": "Hard",
                    "created_at": datetime.now(timezone.utc)
                },
                {
                    "id": "tip-2",
                    "company_slug": slug_clean,
                    "author_name": "Priya S. (Frontend Developer)",
                    "role": "Frontend Specialist",
                    "round_name": "Online Assessment",
                    "tip_content": "The OA had 2 LC Medium questions on DP and Sliding Window + 20 OS/DBMS questions. Time management is crucial!",
                    "difficulty": "Medium",
                    "created_at": datetime.now(timezone.utc)
                }
            ]

        for t in tips:
            if "_id" in t:
                t["_id"] = str(t["_id"])
            t["id"] = str(t.get("_id", t.get("id", "")))
        return tips

    @staticmethod
    async def add_company_tip(user_id: str, author_name: str, slug: str, tip_data: dict, db) -> dict:
        slug_clean = slug.lower().strip()
        record = {
            "user_id": user_id,
            "author_name": author_name or "Anonymous PrepNova User",
            "company_slug": slug_clean,
            "role": tip_data.get("role", "Software Engineer"),
            "round_name": tip_data.get("round_name", "Technical Round"),
            "tip_content": tip_data.get("tip_content", ""),
            "difficulty": tip_data.get("difficulty", "Medium"),
            "created_at": datetime.now(timezone.utc)
        }

        res = await db["company_interview_tips"].insert_one(record)
        record["_id"] = str(res.inserted_id)
        record["id"] = str(res.inserted_id)
        return record

    @staticmethod
    async def save_or_update_company(company_data: dict, db) -> dict:
        slug = company_data.get("slug") or company_data.get("name", "company").lower().strip().replace(" ", "-")
        company_data["slug"] = slug
        company_data["updated_at"] = datetime.now(timezone.utc)

        update_doc = {k: v for k, v in company_data.items() if k not in ["_id", "id"]}
        existing = await db["companies"].find_one({"slug": slug})
        if existing:
            await db["companies"].update_one({"_id": existing["_id"]}, {"$set": update_doc})
            company_data["id"] = str(existing["_id"])
        else:
            result = await db["companies"].insert_one(update_doc)
            company_data["id"] = str(result.inserted_id)

        return company_data

    @staticmethod
    async def delete_company(company_id: str, db) -> dict:
        try:
            query = {"_id": ObjectId(company_id)}
        except Exception:
            query = {"slug": company_id.lower().strip()}

        result = await db["companies"].delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Company not found")
        return {"message": "Company deleted successfully", "id": company_id}

    @staticmethod
    async def add_company_question(question_data: dict, db) -> dict:
        question_data["created_at"] = datetime.now(timezone.utc)
        result = await db["company_questions"].insert_one(question_data)
        question_data["id"] = str(result.inserted_id)
        if "_id" in question_data:
            question_data["_id"] = str(question_data["_id"])
        return question_data

    @staticmethod
    async def update_company_question(question_id: str, question_data: dict, db) -> dict:
        try:
            q_id = ObjectId(question_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid question ID format")

        question_data["updated_at"] = datetime.now(timezone.utc)
        result = await db["company_questions"].update_one({"_id": q_id}, {"$set": question_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        
        question_data["id"] = question_id
        if "_id" in question_data:
            question_data["_id"] = str(question_data["_id"])
        return question_data

    @staticmethod
    async def delete_company_question(question_id: str, db) -> dict:
        try:
            q_id = ObjectId(question_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid question ID format")

        result = await db["company_questions"].delete_one({"_id": q_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        return {"message": "Question deleted successfully", "id": question_id}


