from bson import ObjectId
from typing import Optional

class HistoryService:
    """
    Unified history service.
    Canonical collection for interview data is `interview_sessions`.
    A completed session has status='completed' and a completed_at timestamp.
    """

    @staticmethod
    async def get_user_interview_history(user_id: str, db) -> list:
        """
        Returns completed interview sessions for a user.
        Reads from interview_sessions (canonical source, matches InterviewService).
        """
        cursor = db["interview_sessions"].find(
            {"user_id": user_id, "status": "completed"}
        ).sort("completed_at", -1)
        results = await cursor.to_list(length=100)

        history = []
        for session in results:
            _id = str(session.get("_id", ""))
            responses = session.get("responses", [])
            scores = [r.get("score", 0) for r in responses if isinstance(r.get("score"), (int, float))]
            avg_score = int(sum(scores) / len(scores) * 10) if scores else 0

            history.append({
                "id": _id,
                "session_id": _id,
                "role_target": session.get("role_target", ""),
                "interview_type": session.get("interview_type", "technical"),
                "difficulty": session.get("difficulty", "Medium"),
                "experience_level": session.get("experience_level", ""),
                "status": session.get("status", "completed"),
                "overall_score": avg_score,
                "questions_count": len(session.get("questions", [])),
                "answers_count": len(responses),
                "created_at": session.get("created_at"),
                "completed_at": session.get("completed_at"),
                "duration": session.get("duration"),
            })
        return history

    @staticmethod
    async def get_user_coding_history(user_id: str, db) -> list:
        """
        Returns coding submissions for a user, most recent first.
        Reads from coding_submissions (canonical source, matches CodingService).
        """
        cursor = db["coding_submissions"].find(
            {"user_id": user_id}
        ).sort("submitted_at", -1)
        results = await cursor.to_list(length=100)

        history = []
        for sub in results:
            _id = str(sub.get("_id", ""))
            history.append({
                "id": _id,
                "problem_id": sub.get("problem_id", ""),
                "problem_title": sub.get("problem_title", ""),
                "language": sub.get("language", ""),
                "difficulty": sub.get("difficulty", ""),
                "status": sub.get("status", ""),
                "score": sub.get("score", 0),
                "test_cases_passed": sub.get("test_cases_passed", 0),
                "total_test_cases": sub.get("total_test_cases", 0),
                "submitted_at": sub.get("submitted_at"),
            })
        return history

    @staticmethod
    async def get_user_ats_history(user_id: str, db) -> list:
        """
        Returns ATS analysis history for a user, most recent first.
        Reads from ats_analyses (canonical source, matches ATSService/ats_routes.py).
        """
        cursor = db["ats_analyses"].find(
            {"user_id": user_id}
        ).sort("created_at", -1)
        results = await cursor.to_list(length=100)

        history = []
        for entry in results:
            _id = str(entry.get("_id", ""))
            history.append({
                "id": _id,
                "resume_id": entry.get("resume_id", ""),
                "filename": entry.get("filename", ""),
                "ats_score": entry.get("ats_score", 0),
                "previous_score": entry.get("previous_score"),
                "job_title": entry.get("job_title", ""),
                "status": entry.get("status", "completed"),
                "created_at": entry.get("created_at"),
            })
        return history

    @staticmethod
    async def delete_ats_history_item(user_id: str, ats_id: str, db) -> bool:
        query = {"user_id": str(user_id)}
        try:
            query["_id"] = ObjectId(ats_id)
        except Exception:
            query["_id"] = ats_id

        res = await db["ats_analyses"].delete_one(query)
        if res.deleted_count == 0:
            res = await db["ats_results"].delete_one(query)
        return res.deleted_count > 0

    @staticmethod
    async def clear_all_ats_history(user_id: str, db) -> int:
        res1 = await db["ats_analyses"].delete_many({"user_id": str(user_id)})
        res2 = await db["ats_results"].delete_many({"user_id": str(user_id)})
        return res1.deleted_count + res2.deleted_count

    @staticmethod
    async def get_user_resume_history(user_id: str, db) -> list:
        """
        Returns resume drafts for a user.
        Reads from resumes collection (canonical source, matches ResumeService).
        """
        cursor = db["resumes"].find(
            {"user_id": user_id}
        ).sort("updated_at", -1)
        results = await cursor.to_list(length=100)

        history = []
        for resume in results:
            _id = str(resume.get("_id", ""))
            parsed = resume.get("parsed_content", {}) or {}
            history.append({
                "id": _id,
                "title": resume.get("title") or resume.get("resume_title") or parsed.get("name", "Untitled Resume"),
                "template": resume.get("template", ""),
                "ats_score": resume.get("ats_score") or resume.get("readiness_score", 0),
                "version": resume.get("version", 1),
                "is_shared": resume.get("is_shared", False),
                "created_at": resume.get("created_at"),
                "updated_at": resume.get("updated_at"),
            })
        return history

    @staticmethod
    async def delete_resume_history_item(user_id: str, resume_id: str, db) -> bool:
        """
        Deletes a single resume history item for a user.
        """
        query = {"user_id": user_id}
        try:
            query["_id"] = ObjectId(resume_id)
        except Exception:
            query["_id"] = resume_id

        res = await db["resumes"].delete_one(query)
        return res.deleted_count > 0

    @staticmethod
    async def clear_all_resume_history(user_id: str, db) -> int:
        """
        Deletes all resume history records for a user.
        """
        res = await db["resumes"].delete_many({"user_id": user_id})
        return res.deleted_count
