import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.speech_service import SpeechService
from app.ai.interview_evaluator import InterviewEvaluator
from app.ai.interview_generator import InterviewGenerator

from bson import ObjectId
from app.database import db_manager
from app.services.interview_service import InterviewService
from app.schemas.interview_schema import SubmitAnswerRequest
from datetime import datetime, timezone

router = APIRouter()

class ConnectionManager:
    """
    Manages active WebSocket connections for live AI Mock Interview voice streaming.
    """
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        print(f"[WebSocketManager] Session connected: {session_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            print(f"[WebSocketManager] Session disconnected: {session_id}")

    async def send_json(self, session_id: str, data: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(data)

manager = ConnectionManager()

def compile_feedback_report(session_id: str, session: dict) -> dict:
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
            "audio_file_path": resp.get("audio_file_path", ""),
            "score": resp["score"],
            "strengths": resp["feedback"].get("strengths", []),
            "weaknesses": resp["feedback"].get("weaknesses", []),
            "suggested_answer": resp["feedback"].get("suggested_answer", "")
        })
    return {
        "id": session_id,
        "interview_session_id": session_id,
        "answers_feedback": answers_feedback,
        "overall_summary": "Good overall effort. Focus on technical delivery structure and STAR methodology.",
        "questions": session.get("questions", []),
        "created_at": datetime.now(timezone.utc).isoformat()
    }

@router.websocket("/ws/interview/{session_id}")
async def interview_websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    FastAPI WebSocket route for real-time interview voice streaming & adaptive updates.
    """
    await manager.connect(session_id, websocket)
    db = db_manager.db
    
    try:
        try:
            session_query = {"_id": ObjectId(session_id)}
        except Exception:
            session_query = {"_id": session_id}
            
        session = await db["interview_sessions"].find_one(session_query)
        if not session:
            await websocket.send_json({
                "type": "error",
                "message": f"Session {session_id} not found."
            })
            await websocket.close()
            manager.disconnect(session_id)
            return

        responses = session.get("responses", [])
        questions = session.get("questions", [])

        # Check if already completed
        if len(responses) >= len(questions) and len(questions) > 0:
            feedback = compile_feedback_report(session_id, session)
            await websocket.send_json({
                "type": "interview_completed",
                "feedback_report": feedback
            })
        elif len(responses) > 0:
            # Resume handshake
            next_idx = len(responses)
            next_q = questions[next_idx]
            feedback = compile_feedback_report(session_id, session)
            await websocket.send_json({
                "type": "resume_handshake",
                "message": f"Resuming your interview. Let's continue with question {next_idx + 1}.",
                "next_question_idx": next_idx,
                "next_question": {
                    "question_id": next_q["question_id"],
                    "text": next_q["text"]
                },
                "feedback_report": feedback
            })
        else:
            # Start fresh
            welcome_tts = await SpeechService.text_to_speech(
                "Welcome to your AI Mock Interview. I am your AI interviewer today. Let's begin!"
            )
            await websocket.send_json({
                "type": "ai_intro",
                "message": "Welcome to your AI Mock Interview! Please introduce yourself.",
                "voice_url": welcome_tts
            })

        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)
            action_type = payload.get("type", "")

            if action_type == "candidate_speech_chunk":
                transcript = payload.get("transcript", "")
                await websocket.send_json({
                    "type": "interim_transcript",
                    "text": transcript
                })

            elif action_type == "submit_answer":
                q_id = payload.get("question_id")
                answer_text = payload.get("answer", "")
                audio_file_path = payload.get("audio_file_path")

                submit_req = SubmitAnswerRequest(
                    question_id=q_id,
                    answer_text=answer_text,
                    audio_file_path=audio_file_path
                )

                # evaluate_answer transcribes audio via Whisper and generates the next adaptive question
                feedback = await InterviewService.evaluate_answer(
                    user_id=session.get("user_id"),
                    session_id=session_id,
                    submit_req=submit_req,
                    db=db
                )

                # Fetch the updated session state
                updated_session = await db["interview_sessions"].find_one(session_query)
                updated_responses = updated_session.get("responses", [])
                updated_questions = updated_session.get("questions", [])

                # Find current answer evaluation score
                latest_score = 70
                for resp in updated_responses:
                    if resp["question_id"] == q_id:
                        latest_score = resp["score"] * 10
                        break

                if len(updated_responses) >= len(updated_questions):
                    await websocket.send_json({
                        "type": "interview_completed",
                        "feedback_report": feedback
                    })
                else:
                    next_idx = len(updated_responses)
                    next_q = updated_questions[next_idx]
                    next_q_voice_url = await SpeechService.text_to_speech(next_q["text"])

                    await websocket.send_json({
                        "type": "ai_response",
                        "evaluation": {
                            "score": latest_score,
                            "feedback": "Response evaluated successfully",
                            "next_difficulty": updated_session.get("difficulty", "Medium")
                        },
                        "next_question": {
                            "question_id": next_q["question_id"],
                            "text": next_q["text"],
                            "voice_url": next_q_voice_url,
                            "is_followup": True
                        },
                        "feedback_report": feedback
                    })

    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        print(f"[WebSocket] Session error in {session_id}: {e}")
        manager.disconnect(session_id)

