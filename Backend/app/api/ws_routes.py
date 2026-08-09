import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.speech_service import SpeechService

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

@router.websocket("/ws/interview/{session_id}")
async def interview_websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    FastAPI WebSocket route for real-time interview voice streaming & adaptive updates.
    """
    await manager.connect(session_id, websocket)
    try:
        # Send initial handshake welcome event
        welcome_tts = await SpeechService.text_to_speech(
            "Welcome to your AI Mock Interview. I am your AI interviewer today. Let's begin!"
        )
        await websocket.send_json({
            "type": "ai_intro",
            "message": "Welcome to your AI Mock Interview! Please introduce yourself.",
            "voice_url": welcome_tts,
            "difficulty": "Medium"
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
                candidate_answer = payload.get("answer", "")
                current_score = payload.get("score", 85)

                # Determine adaptive difficulty
                new_difficulty = "Medium"
                if current_score >= 80:
                    new_difficulty = "Hard"
                elif current_score < 60:
                    new_difficulty = "Easy"

                # Synthesize AI follow-up voice prompt
                ai_text = f"Good explanation. Moving to a {new_difficulty} tier question: Can you explain system trade-offs when scaling under high concurrency?"
                ai_voice_url = await SpeechService.text_to_speech(ai_text)

                await websocket.send_json({
                    "type": "ai_response",
                    "evaluation": {
                        "score": current_score,
                        "feedback": "Clear explanation of core technical principles.",
                        "next_difficulty": new_difficulty
                    },
                    "next_question": {
                        "text": ai_text,
                        "voice_url": ai_voice_url,
                        "is_followup": True
                    }
                })

    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        print(f"[WebSocket] Session error in {session_id}: {e}")
        manager.disconnect(session_id)
