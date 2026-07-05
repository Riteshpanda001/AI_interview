from bson import ObjectId

class FeedbackService:
    @staticmethod
    async def get_feedback(session_id: str, db) -> dict:
        session = await db["interview_sessions"].find_one({"_id": ObjectId(session_id)})
        if not session:
            return {}
            
        answers_feedback = []
        for resp in session.get("responses", []):
            q_text = ""
            for q in session.get("questions", []):
                if q["question_id"] == resp["question_id"]:
                    q_text = q["text"]
                    break
            answers_feedback.append({
                "question_id": resp["question_id"],
                "question_text": q_text,
                "user_answer": resp["answer_text"],
                "score": resp["score"],
                "strengths": resp["feedback"].get("strengths", []),
                "weaknesses": resp["feedback"].get("weaknesses", []),
                "suggested_answer": resp["feedback"].get("suggested_answer", "")
            })
            
        return {
            "id": session_id,
            "interview_session_id": session_id,
            "answers_feedback": answers_feedback,
            "overall_summary": "Review complete. Outstanding performance on core concepts.",
            "created_at": session.get("created_at")
        }
