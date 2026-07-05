from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
from app.ai.interview_generator import InterviewGenerator
from app.ai.interview_evaluator import InterviewEvaluator
from app.schemas.interview_schema import SubmitAnswerRequest

class InterviewService:
    @staticmethod
    async def create_session(user_id: str, role_target: str, interview_type: str, db) -> dict:
        # Generate interview questions using AI engine
        generated_questions = await InterviewGenerator.generate_questions(role_target, interview_type, count=5)
        
        session_record = {
            "user_id": user_id,
            "role_target": role_target,
            "interview_type": interview_type,
            "status": "pending",
            "questions": generated_questions,
            "responses": [],
            "created_at": datetime.utcnow()
        }
        
        result = await db["interview_sessions"].insert_one(session_record)
        session_record["id"] = str(result.inserted_id)
        
        return session_record

    @staticmethod
    async def evaluate_answer(user_id: str, session_id: str, submit_req: SubmitAnswerRequest, db) -> dict:
        session = await db["interview_sessions"].find_one({"_id": ObjectId(session_id), "user_id": user_id})
        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found.")
            
        # Find target question in session
        target_question = None
        for q in session.get("questions", []):
            if q["question_id"] == submit_req.question_id:
                target_question = q
                break
                
        if not target_question:
            raise HTTPException(status_code=400, detail="Question ID does not belong to this session.")
            
        # Evaluate response text
        evaluation = await InterviewEvaluator.evaluate_answer(
            question_text=target_question["text"],
            user_answer=submit_req.answer_text
        )
        
        # Append response to session log
        response_log = {
            "question_id": submit_req.question_id,
            "answer_text": submit_req.answer_text,
            "audio_file_path": submit_req.audio_file_path,
            "score": evaluation.get("score", 7),
            "feedback": evaluation
        }
        
        await db["interview_sessions"].update_one(
            {"_id": ObjectId(session_id)},
            {"$push": {"responses": response_log}}
        )
        
        # Check if all questions are answered, update session to completed
        updated_session = await db["interview_sessions"].find_one({"_id": ObjectId(session_id)})
        if len(updated_session.get("responses", [])) >= len(updated_session.get("questions", [])):
            # Mark complete
            await db["interview_sessions"].update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
            )
            
            # Generate overall result summary
            scores = [resp["score"] for resp in updated_session["responses"]]
            avg_score = int(sum(scores) / len(scores) * 10) if scores else 0
            
            result_record = {
                "interview_session_id": session_id,
                "user_id": user_id,
                "overall_score": avg_score,
                "scores_breakdown": {
                    "communication": avg_score,
                    "technical": avg_score - 5 if avg_score > 5 else avg_score,
                    "confidence": avg_score + 5 if avg_score < 95 else avg_score
                },
                "verdict": "Hire" if avg_score >= 70 else "No Hire",
                "created_at": datetime.utcnow()
            }
            await db["interview_results"].insert_one(result_record)
            
        # Compile response
        answers_feedback = []
        for resp in updated_session.get("responses", []):
            # find corresponding question
            q_text = ""
            for q in updated_session.get("questions", []):
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
            
        feedback_record = {
            "id": session_id,
            "interview_session_id": session_id,
            "answers_feedback": answers_feedback,
            "overall_summary": "Good overall effort. Focus on technical delivery structure.",
            "created_at": datetime.utcnow()
        }
        
        return feedback_record
