import os
import hashlib
import asyncio
import logging

logger = logging.getLogger(__name__)


class SpeechService:
    """
    Enterprise Real Speech Service for AI Mock Interviews.
    Provides real Speech-to-Text (STT) transcription and real Text-to-Speech (TTS) synthesis.
    
    TTS: Uses Google Text-to-Speech (gTTS). Returns None on failure — never fakes audio.
    STT: Uses Groq Cloud Whisper or local OpenAI Whisper fallback.
    """

    AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "audio")
    # Maximum number of cached audio files before cleanup
    MAX_AUDIO_FILES = 500

    @classmethod
    def _ensure_audio_dir(cls):
        if not os.path.exists(cls.AUDIO_DIR):
            os.makedirs(cls.AUDIO_DIR, exist_ok=True)

    @classmethod
    def _cleanup_old_audio_files(cls):
        """Remove oldest audio files when cache exceeds MAX_AUDIO_FILES."""
        try:
            if not os.path.exists(cls.AUDIO_DIR):
                return
            files = []
            for f in os.listdir(cls.AUDIO_DIR):
                fp = os.path.join(cls.AUDIO_DIR, f)
                if os.path.isfile(fp) and f.endswith(".mp3"):
                    files.append((fp, os.path.getmtime(fp)))

            if len(files) > cls.MAX_AUDIO_FILES:
                files.sort(key=lambda x: x[1])
                for fp, _ in files[:len(files) - cls.MAX_AUDIO_FILES]:
                    try:
                        os.remove(fp)
                        logger.debug(f"[SpeechService] Cleaned up old audio file: {fp}")
                    except OSError:
                        pass
        except Exception as e:
            logger.warning(f"[SpeechService] Audio cleanup error: {e}")

    @staticmethod
    async def transcribe_audio(file_path: str) -> str:
        """
        Transcribes candidate audio recorded during interview.
        Uses Groq Cloud Whisper API if key is available, or local OpenAI Whisper model fallback.
        Returns empty string if transcription fails — never returns fake text.
        """
        if not file_path or not os.path.exists(file_path):
            logger.warning(f"[SpeechService] Audio file not found: {file_path}")
            return ""

        # ── 1. Cloud Whisper (Groq API) ──────────────────────────────────────
        from app.config import settings
        import httpx

        groq_api_key = settings.GROQ_API_KEY
        if groq_api_key and groq_api_key not in ("your-groq-api-key-here", "", None):
            try:
                url = "https://api.groq.com/openai/v1/audio/transcriptions"
                headers = {"Authorization": f"Bearer {groq_api_key}"}

                with open(file_path, "rb") as f:
                    files = {"file": (os.path.basename(file_path), f, "audio/webm")}
                    data = {"model": "whisper-large-v3"}

                    async with httpx.AsyncClient(timeout=30.0) as client:
                        resp = await client.post(url, headers=headers, files=files, data=data)
                        if resp.status_code == 200:
                            transcribed = resp.json().get("text", "").strip()
                            if transcribed:
                                logger.info(f"[SpeechService] Cloud Whisper transcription success ({len(transcribed)} chars)")
                                return transcribed
            except Exception as ce:
                logger.warning(f"[SpeechService] Groq Cloud Whisper error: {ce}")

        # ── 2. Local Whisper model fallback ──────────────────────────────────
        try:
            import whisper
            loop = asyncio.get_event_loop()
            model = await loop.run_in_executor(None, lambda: whisper.load_model("tiny"))
            result = await loop.run_in_executor(None, lambda: model.transcribe(file_path))
            transcribed = result.get("text", "").strip()
            if transcribed:
                logger.info("[SpeechService] Local Whisper STT success")
                return transcribed
        except ImportError:
            logger.debug("[SpeechService] Local Whisper not installed")
        except Exception as e:
            logger.warning(f"[SpeechService] Local Whisper STT error: {e}")

        # No fallback fake text — return empty so caller can handle gracefully
        logger.warning("[SpeechService] All STT methods failed — returning empty string")
        return ""

    @staticmethod
    async def text_to_speech(text: str, voice_gender: str = "female", language: str = "en") -> str | None:
        """
        Generates MP3 voice audio using Google Text-to-Speech (gTTS).
        Saves to static audio directory and returns the static URL path.

        Returns:
            str: URL path like "/static/audio/speech_HASH.mp3" on success
            None: if TTS generation fails (never returns fake audio bytes)

        IMPORTANT: This method never writes fake/stub audio bytes.
        If gTTS is unavailable, returns None so the caller can return
        a proper error response to the client.
        """
        if not text or not text.strip():
            return None

        SpeechService._ensure_audio_dir()
        SpeechService._cleanup_old_audio_files()

        text_hash = hashlib.md5(f"{text}_{voice_gender}_{language}".encode("utf-8")).hexdigest()[:12]
        filename = f"speech_{text_hash}.mp3"
        file_path = os.path.join(SpeechService.AUDIO_DIR, filename)
        public_url = f"/static/audio/{filename}"

        # Return cached file if it already exists and is a valid MP3
        if os.path.exists(file_path) and os.path.getsize(file_path) > 100:
            return public_url

        try:
            clean_text = text.replace("*", "").replace("#", "").strip()
            if len(clean_text) > 400:
                clean_text = clean_text[:400] + "..."

            lang_code = "en"
            lang_map = {
                "es": "es", "spanish": "es",
                "fr": "fr", "french": "fr",
                "de": "de", "german": "de",
                "hi": "hi", "hindi": "hi",
                "pt": "pt", "portuguese": "pt",
                "it": "it", "italian": "it",
            }
            if language:
                lang_code = lang_map.get(language.lower(), "en")

            loop = asyncio.get_event_loop()

            from gtts import gTTS

            def synthesize_gtts():
                tts = gTTS(text=clean_text, lang=lang_code, slow=False)
                tts.save(file_path)

            await loop.run_in_executor(None, synthesize_gtts)

            # Verify the file is a real MP3 (not empty or corrupted)
            if not os.path.exists(file_path) or os.path.getsize(file_path) < 100:
                logger.error(f"[SpeechService] gTTS produced an empty/invalid file: {file_path}")
                if os.path.exists(file_path):
                    os.remove(file_path)
                return None

            logger.info(f"[SpeechService] TTS audio generated: {filename} ({os.path.getsize(file_path)} bytes)")
            return public_url

        except ImportError:
            logger.error(
                "[SpeechService] gTTS library not installed. "
                "Install it with: pip install gTTS"
            )
            return None
        except Exception as e:
            logger.error(f"[SpeechService] TTS generation failed: {e}")
            # Remove any partial/corrupt file
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except OSError:
                    pass
            return None
