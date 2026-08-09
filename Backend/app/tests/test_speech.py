import asyncio
import os
import pytest
from app.services.speech_service import SpeechService

def test_speech_service_tts():
    async def run():
        text = "Hello candidate, welcome to your AI Mock Interview."
        voice_url = await SpeechService.text_to_speech(text, voice_gender="female", language="en")
        
        assert voice_url is not None
        assert voice_url.startswith("/static/audio/")
        assert voice_url.endswith(".mp3")
        
        # Verify file exists on local disk
        filename = voice_url.split("/")[-1]
        local_path = os.path.join(SpeechService.AUDIO_DIR, filename)
        assert os.path.exists(local_path)
        assert os.path.getsize(local_path) > 100

    asyncio.run(run())

def test_speech_service_stt_fallback():
    async def run():
        # Passing non-existent audio file returns robust transcription text
        transcribed = await SpeechService.transcribe_audio("non_existent_audio.wav")
        assert transcribed is not None
        assert len(transcribed) > 10

    asyncio.run(run())
