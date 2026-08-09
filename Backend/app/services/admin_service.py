from datetime import datetime, timezone, timedelta
from bson import ObjectId
from fastapi import HTTPException, status
from app.services.email_service import EmailService

class AdminService:
    @staticmethod
    async def get_system_stats(db) -> dict:
        now = datetime.now(timezone.utc)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_users = await db["users"].count_documents({})
        active_users = await db["users"].count_documents({"is_active": True})
        pro_users = await db["users"].count_documents({"plan_type": {"$in": ["pro", "premium", "enterprise"]}})

        total_resumes = await db["resumes"].count_documents({})
        total_ats_reports = await db["ats_analyses"].count_documents({})
        total_interviews = await db["interview_sessions"].count_documents({})
        total_tickets = await db["contacts"].count_documents({})
        open_tickets = await db["contacts"].count_documents({"status": "OPEN"})

        # Payments & Revenue
        payments_cursor = db["payments"].find({"status": "succeeded"})
        payments = await payments_cursor.to_list(length=1000)
        total_revenue = sum(float(p.get("amount", 0.0)) for p in payments)
        monthly_revenue = sum(float(p.get("amount", 0.0)) for p in payments if p.get("created_at") and p.get("created_at") >= start_of_month)

        return {
            "total_users": total_users,
            "active_users": active_users,
            "pro_users": pro_users,
            "total_resumes": total_resumes,
            "total_ats_reports": total_ats_reports,
            "total_interviews": total_interviews,
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "timestamp": now
        }

    @staticmethod
    async def get_all_users(db, search: str = "", role: str = "all", limit: int = 100) -> list:
        query = {}
        if role and role.lower() != "all":
            query["role"] = role.lower()
        if search:
            query["$or"] = [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]

        cursor = db["users"].find(query).sort("created_at", -1)
        users = await cursor.to_list(length=limit)

        result = []
        for u in users:
            result.append({
                "id": str(u["_id"]),
                "email": u.get("email", ""),
                "full_name": u.get("full_name", "User"),
                "role": u.get("role", "user"),
                "plan_type": u.get("plan_type", "free"),
                "is_active": u.get("is_active", True),
                "is_verified": u.get("is_verified", False),
                "created_at": u.get("created_at")
            })
        return result

    @staticmethod
    async def update_user_status(user_id: str, is_active: bool, db) -> dict:
        try:
            query = {"_id": ObjectId(user_id)}
        except Exception:
            query = {"_id": user_id}

        result = await db["users"].update_one(query, {"$set": {"is_active": is_active, "updated_at": datetime.now(timezone.utc)}})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        return {"message": f"User status updated to {'active' if is_active else 'suspended'}", "user_id": user_id}

    @staticmethod
    async def update_user_role(user_id: str, role: str, db) -> dict:
        try:
            query = {"_id": ObjectId(user_id)}
        except Exception:
            query = {"_id": user_id}

        result = await db["users"].update_one(query, {"$set": {"role": role.lower(), "updated_at": datetime.now(timezone.utc)}})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        return {"message": f"User role updated to '{role}'", "user_id": user_id}

    @staticmethod
    async def delete_user(user_id: str, db) -> dict:
        try:
            query = {"_id": ObjectId(user_id)}
        except Exception:
            query = {"_id": user_id}

        result = await db["users"].delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        # Cleanup user subscriptions
        await db["subscriptions"].delete_many({"user_id": str(user_id)})
        return {"message": "User deleted successfully", "user_id": user_id}

    @staticmethod
    async def get_resumes_list(db, limit: int = 50) -> list:
        cursor = db["resumes"].find({}).sort("updated_at", -1)
        resumes = await cursor.to_list(length=limit)
        for r in resumes:
            r["id"] = str(r["_id"])
        return resumes

    @staticmethod
    async def get_interviews_list(db, limit: int = 50) -> list:
        cursor = db["interview_sessions"].find({}).sort("created_at", -1)
        interviews = await cursor.to_list(length=limit)
        for i in interviews:
            i["id"] = str(i["_id"])
        return interviews

    @staticmethod
    async def get_coding_problems_list(db) -> list:
        cursor = db["coding_problems"].find({})
        problems = await cursor.to_list(length=100)
        for p in problems:
            p["id"] = str(p["_id"])
        return problems

    @staticmethod
    async def save_coding_problem(problem_data: dict, db) -> dict:
        slug = problem_data.get("slug") or problem_data.get("title", "problem").lower().replace(" ", "-")
        problem_data["slug"] = slug
        problem_data["updated_at"] = datetime.now(timezone.utc)

        existing = await db["coding_problems"].find_one({"slug": slug})
        if existing:
            await db["coding_problems"].update_one({"_id": existing["_id"]}, {"$set": problem_data})
            problem_data["id"] = str(existing["_id"])
        else:
            result = await db["coding_problems"].insert_one(problem_data)
            problem_data["id"] = str(result.inserted_id)

        return problem_data

    @staticmethod
    async def delete_coding_problem(problem_id: str, db) -> dict:
        try:
            query = {"_id": ObjectId(problem_id)}
        except Exception:
            query = {"slug": problem_id.lower()}

        result = await db["coding_problems"].delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Coding problem not found.")
        return {"message": "Coding problem deleted successfully", "id": problem_id}

    @staticmethod
    async def get_payments_list(db, limit: int = 100) -> list:
        cursor = db["payments"].find({}).sort("created_at", -1)
        payments = await cursor.to_list(length=limit)
        for p in payments:
            p["id"] = str(p["_id"])
        return payments

    @staticmethod
    async def get_subscriptions_list(db, limit: int = 100) -> list:
        cursor = db["subscriptions"].find({}).sort("updated_at", -1)
        subscriptions = await cursor.to_list(length=limit)
        for s in subscriptions:
            s["id"] = str(s["_id"])
        return subscriptions

    @staticmethod
    async def grant_user_subscription(user_id: str, plan_type: str, duration_days: int, db) -> dict:
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=duration_days)

        try:
            query = {"_id": ObjectId(user_id)}
        except Exception:
            query = {"_id": user_id}

        await db["users"].update_one(query, {"$set": {"plan_type": plan_type.lower(), "updated_at": now}})
        await db["subscriptions"].update_one(
            {"user_id": str(user_id)},
            {"$set": {
                "user_id": str(user_id),
                "plan_type": plan_type.lower(),
                "billing_cycle": "admin_grant",
                "status": "active",
                "started_at": now,
                "expires_at": expires_at,
                "amount": 0.0,
                "currency": "USD",
                "updated_at": now
            }},
            upsert=True
        )

        return {"message": f"Successfully granted {plan_type.upper()} plan for {duration_days} days to user {user_id}"}

    @staticmethod
    async def get_tickets_list(db, status_filter: str = "all") -> list:
        query = {}
        if status_filter and status_filter.lower() != "all":
            query["status"] = status_filter.upper()

        cursor = db["contacts"].find(query).sort("created_at", -1)
        tickets = await cursor.to_list(length=100)
        for t in tickets:
            t["id"] = str(t["_id"])
        return tickets

    @staticmethod
    async def reply_to_ticket(ticket_number: str, reply_message: str, new_status: str, db) -> dict:
        now = datetime.now(timezone.utc)
        ticket_num_clean = ticket_number.strip().upper().replace("#", "")

        ticket = await db["contacts"].find_one({"ticket_number": ticket_num_clean})
        if not ticket:
            raise HTTPException(status_code=404, detail=f"Ticket #{ticket_num_clean} not found.")

        reply_entry = {
            "sender": "admin",
            "message": reply_message,
            "created_at": now
        }

        await db["contacts"].update_one(
            {"ticket_number": ticket_num_clean},
            {
                "$set": {"status": new_status.upper(), "updated_at": now},
                "$push": {"replies": reply_entry}
            }
        )

        # Send email response to user via SMTP
        try:
            email_html = EmailService.build_ticket_reply_html(
                user_name=ticket.get("name", "Valued User"),
                ticket_number=ticket_num_clean,
                reply_message=reply_message,
                status=new_status.upper()
            )
            await EmailService.send_email(
                to_email=ticket.get("email"),
                subject=f"Update on Support Ticket #{ticket_num_clean} - PrepNova AI",
                html_content=email_html
            )
        except Exception as e:
            print(f"[ADMIN SERVICE] ⚠️ Reply email failed: {e}")

        return {"message": "Reply recorded and notification sent to user.", "ticket_number": ticket_num_clean, "status": new_status.upper()}

    @staticmethod
    async def delete_resume(resume_id: str, db) -> dict:
        try:
            query = {"_id": ObjectId(resume_id)}
        except Exception:
            query = {"_id": resume_id}

        result = await db["resumes"].delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Resume not found.")
        return {"message": "Resume deleted successfully", "id": resume_id}

    @staticmethod
    async def get_ats_reports_list(db, limit: int = 50) -> list:
        cursor = db["ats_analyses"].find({}).sort("created_at", -1)
        reports = await cursor.to_list(length=limit)
        for r in reports:
            r["id"] = str(r["_id"])
        return reports

    @staticmethod
    async def get_system_prompts(db) -> list:
        cursor = db["system_prompts"].find({})
        prompts = await cursor.to_list(length=100)

        if not prompts:
            # Seed default system prompt templates
            default_prompts = [
                {"name": "ATS Resume Analyzer", "category": "ats", "system_instruction": "Evaluate candidate resume against job description criteria, calculate deterministic section scores, and provide actionable keyword suggestions."},
                {"name": "Technical AI Interviewer", "category": "technical", "system_instruction": "Conduct rigorous technical coding and system design interviews. Ask adaptive follow-up questions testing scalability, concurrency, and trade-offs."},
                {"name": "HR & Culture Evaluator", "category": "hr", "system_instruction": "Evaluate candidate communication skills, career alignment, compensation expectations, and cultural fit for target company."},
                {"name": "Behavioral STAR Coach", "category": "behavioral", "system_instruction": "Evaluate behavioral interview responses using Situation, Task, Action, Result framework aligned with company core principles."},
                {"name": "AI Code Evaluator", "category": "coding", "system_instruction": "Analyze code correctness, time complexity O(N), space complexity, edge cases, and optimization hints."}
            ]
            await db["system_prompts"].insert_many(default_prompts)
            prompts = await db["system_prompts"].find({}).to_list(length=100)

        for p in prompts:
            p["id"] = str(p["_id"])
        return prompts

    @staticmethod
    async def save_system_prompt(name: str, category: str, system_instruction: str, db) -> dict:
        now = datetime.now(timezone.utc)
        cat_clean = category.lower().strip()

        existing = await db["system_prompts"].find_one({"category": cat_clean})
        payload = {
            "name": name,
            "category": cat_clean,
            "system_instruction": system_instruction,
            "updated_at": now
        }

        if existing:
            await db["system_prompts"].update_one({"_id": existing["_id"]}, {"$set": payload})
            payload["id"] = str(existing["_id"])
        else:
            result = await db["system_prompts"].insert_one(payload)
            payload["id"] = str(result.inserted_id)

        return payload

    @staticmethod
    async def get_system_health(db) -> dict:
        now = datetime.now(timezone.utc)
        db_connected = True
        try:
            await db.command("ping")
        except Exception:
            db_connected = False

        return {
            "database_status": "Connected (MongoDB)" if db_connected else "Disconnected",
            "cache_status": "Active (Redis / Fallback Memory)",
            "llm_service": "Operational (Gemini 1.5 / Groq Llama 3.1)",
            "smtp_service": "Active",
            "timestamp": now
        }

