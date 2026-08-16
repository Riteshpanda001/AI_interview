from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException
from app.ai.interview_generator import InterviewGenerator
from app.ai.interview_evaluator import InterviewEvaluator
from app.schemas.interview_schema import SubmitAnswerRequest

class InterviewService:
    @staticmethod
    async def create_session(
        user_id: str,
        role_target: str,
        interview_type: str,
        db,
        experience_level: str = None,
        language: str = None,
        duration: int = None,
        difficulty: str = None,
        resume_id: str = None
    ) -> dict:
        # Get parsed resume content if resume_id is provided
        resume_text = ""
        if resume_id:
            try:
                resume_record = await db["resumes"].find_one({"_id": ObjectId(resume_id), "user_id": user_id})
                if resume_record:
                    resume_text = resume_record.get("extracted_text", "") or resume_record.get("parsed_content", {}).get("raw_text", "")
            except Exception as e:
                print(f"Error fetching resume details: {e}")

        # Count questions based on duration (45 mins -> 8 questions, 60 mins -> 10 questions)
        num_questions = 8
        if duration:
            if duration >= 60:
                num_questions = 10
            elif duration >= 45:
                num_questions = 8
            else:
                num_questions = max(3, min(10, int(duration // 5)))

        # Generate interview questions using AI engine
        generated_questions = await InterviewGenerator.generate_questions(
            role_target=role_target,
            interview_type=interview_type,
            experience_level=experience_level,
            language=language,
            duration=duration,
            difficulty=difficulty,
            resume_text=resume_text,
            count=num_questions
        )
        
        session_record = {
            "user_id": user_id,
            "role_target": role_target,
            "interview_type": interview_type,
            "experience_level": experience_level,
            "language": language,
            "duration": duration,
            "difficulty": difficulty,
            "resume_id": resume_id,
            "status": "pending",
            "questions": generated_questions,
            "responses": [],
            "created_at": datetime.now(timezone.utc)
        }
        
        result = await db["interview_sessions"].insert_one(session_record)
        session_record["_id"] = str(result.inserted_id)
        session_record["id"] = str(result.inserted_id)
        
        return session_record

    @staticmethod
    async def evaluate_answer(user_id: str, session_id: str, submit_req: SubmitAnswerRequest, db) -> dict:
        try:
            session_query = {"_id": ObjectId(session_id), "user_id": user_id}
            id_query = {"_id": ObjectId(session_id)}
        except Exception:
            session_query = {"_id": session_id, "user_id": user_id}
            id_query = {"_id": session_id}

        session = await db["interview_sessions"].find_one(session_query)
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
            
        # ── 1. Transcribe audio with Whisper if audio file path is provided ──
        candidate_answer = submit_req.answer_text
        if submit_req.audio_file_path:
            try:
                from app.services.speech_service import SpeechService
                transcribed = await SpeechService.transcribe_audio(submit_req.audio_file_path)
                if transcribed:
                    candidate_answer = transcribed
            except Exception as se:
                print(f"Error transcribing candidate response: {se}")

        # Evaluate response text
        evaluation = await InterviewEvaluator.evaluate_answer(
            question_text=target_question["text"],
            user_answer=candidate_answer
        )
        
        # Append response to session log
        response_log = {
            "question_id": submit_req.question_id,
            "answer_text": candidate_answer,
            "audio_file_path": submit_req.audio_file_path,
            "score": evaluation.get("score", 7),
            "feedback": evaluation
        }
        
        await db["interview_sessions"].update_one(
            id_query,
            {"$push": {"responses": response_log}}
        )

        
        # ── Adapt next question dynamically based on answer score ───────────
        questions = list(session.get("questions", []))
        current_idx = -1
        for idx, q in enumerate(questions):
            if q["question_id"] == submit_req.question_id:
                current_idx = idx
                break

        score = evaluation.get("score", 7)
        if current_idx != -1 and current_idx < len(questions) - 1:
            # Determine target difficulty based on score (>= 8 -> Hard/Medium, < 6 -> Easy/Medium)
            curr_diff = session.get("difficulty", "Medium") or "Medium"
            if score >= 8:
                next_diff = "Hard" if curr_diff == "Medium" else "Medium"
            elif score < 6:
                next_diff = "Easy" if curr_diff == "Medium" else "Medium"
            else:
                next_diff = curr_diff

            # Generate next question dynamically using InterviewGenerator
            history_texts = [q["text"] for q in questions[:current_idx + 1]]
            adaptive_question = await InterviewGenerator.generate_adaptive_question(
                role_target=session.get("role_target", "Software Engineer"),
                interview_type=session.get("interview_type", "technical"),
                experience_level=session.get("experience_level", "Mid Level"),
                previous_question=target_question["text"],
                previous_answer=submit_req.answer_text,
                difficulty=next_diff,
                history_questions=history_texts
            )
            
            # Replace next question with the adaptive one
            next_q = questions[current_idx + 1]
            next_q["text"] = adaptive_question.get("text", next_q["text"])
            
            # Save the updated questions list back to the DB session
            await db["interview_sessions"].update_one(
                id_query,
                {"$set": {"questions": questions}}
            )

        # Check if all questions are answered, update session to completed
        updated_session = await db["interview_sessions"].find_one(id_query)
        if len(updated_session.get("responses", [])) >= len(updated_session.get("questions", [])):
            # Mark complete
            await db["interview_sessions"].update_one(
                id_query,
                {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
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
                "created_at": datetime.now(timezone.utc)
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
                "audio_file_path": resp.get("audio_file_path", ""),
                "score": resp["score"],
                "strengths": resp["feedback"].get("strengths", []),
                "weaknesses": resp["feedback"].get("weaknesses", []),
                "suggested_answer": resp["feedback"].get("suggested_answer", "")
            })
            
        feedback_record = {
            "id": session_id,
            "interview_session_id": session_id,
            "answers_feedback": answers_feedback,
            "overall_summary": "Good overall effort. Focus on technical delivery structure and STAR methodology.",
            "questions": updated_session.get("questions", []),
            "created_at": datetime.now(timezone.utc)
        }
        
        return feedback_record


    @staticmethod
    async def generate_interview_pdf(session_id: str, user_id: str, db) -> bytes:
        from app.utils.pdf_generator import InterviewPDFGenerator
        try:
            session_query = {"_id": ObjectId(session_id), "user_id": user_id}
        except Exception:
            session_query = {"_id": session_id, "user_id": user_id}

        session = await db["interview_sessions"].find_one(session_query)
        if not session:
            # Fallback if session id was created dynamically in offline mode
            session = {
                "_id": session_id,
                "id": session_id,
                "role_target": "Software Engineer",
                "experience_level": "Mid-Level",
                "interview_type": "Technical & Behavioral",
                "created_at": datetime.now(timezone.utc)
            }

        # Build feedback details from session responses
        answers_feedback = []
        for idx, resp in enumerate(session.get("responses", []), 1):
            q_text = f"Question {idx}"
            for q in session.get("questions", []):
                if q["question_id"] == resp.get("question_id"):
                    q_text = q["text"]
                    break
            answers_feedback.append({
                "question_id": resp.get("question_id", f"q{idx}"),
                "question_text": q_text,
                "user_answer": resp.get("answer_text", "Sample candidate answer."),
                "score": resp.get("score", 8),
                "strengths": ["Clear structure", "Good domain vocabulary"],
                "weaknesses": ["Quantify architectural impacts"],
                "suggested_answer": "Use STAR format: Situation, Task, Action, and Result with percentage metrics."
            })

        if not answers_feedback:
            answers_feedback = [
                {
                    "question_id": "q1",
                    "question_text": "Tell me about yourself and your technical background.",
                    "user_answer": "I am a full-stack developer with 3+ years of experience building web applications.",
                    "score": 8,
                    "strengths": ["Clear introduction", "Relevant tech stack"],
                    "weaknesses": ["Include impact metrics"],
                    "suggested_answer": "Highlight core project achievements and scale of users served."
                }
            ]

        feedback_data = {
            "answers_feedback": answers_feedback,
            "overall_summary": "Demonstrated strong domain technical knowledge and clear articulation. Continue practicing STAR behavioral frameworks."
        }

        return InterviewPDFGenerator.generate_pdf(session, feedback_data)

