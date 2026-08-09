from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException

class CompanyService:
    @staticmethod
    async def get_all_companies(db) -> list:
        cursor = db["companies"].find({})
        companies = await cursor.to_list(length=100)
        for comp in companies:
            comp["id"] = str(comp["_id"])
        return companies

    @staticmethod
    async def get_company_by_slug(slug: str, db) -> dict:
        slug_clean = slug.lower().strip()
        comp = await db["companies"].find_one({"slug": slug_clean})
        if not comp:
            # Fallback to search by name or return default company structure
            comp = await db["companies"].find_one({"name": {"$regex": slug_clean, "$options": "i"}})
        
        if comp:
            comp["id"] = str(comp["_id"])
            return comp
            
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
    async def get_company_questions(slug: str, category: str, db) -> list:
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
                return comp["questions"]

        for q in questions:
            q["id"] = str(q["_id"])
        return questions

    @staticmethod
    async def save_or_update_company(company_data: dict, db) -> dict:
        slug = company_data.get("slug") or company_data.get("name", "company").lower().strip().replace(" ", "-")
        company_data["slug"] = slug
        company_data["updated_at"] = datetime.now(timezone.utc)

        existing = await db["companies"].find_one({"slug": slug})
        if existing:
            await db["companies"].update_one({"_id": existing["_id"]}, {"$set": company_data})
            company_data["id"] = str(existing["_id"])
        else:
            result = await db["companies"].insert_one(company_data)
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

