class SpeechService:
    @staticmethod
    async def transcribe_audio(file_path: str) -> str:
        """
        Mock implementation of speech-to-text (e.g. Whisper API)
        """
        print(f"Transcribing audio file: {file_path}")
        return "This is a mock transcribed response from the user candidate."

    @staticmethod
    async def text_to_speech(text: str, voice_gender: str = "female") -> str:
        """
        Mock implementation of text-to-speech (e.g. gTTS, Azure TTS)
        """
        print(f"Generating voice for text: '{text}' in gender: {voice_gender}")
        # Return path to audio file
        return "/static/reports/sample_voice.mp3"
