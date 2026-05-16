import os
import whisper
import warnings
import ssl
import urllib.request
from openai import OpenAI
from backend.core.config import Config
from backend.security.logger import logger

# Fix SSL certificate verification on macOS
ssl._create_default_https_context = ssl._create_unverified_context

# Suppress whisper warnings
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")

class SpeechToText:
    def __init__(self, use_api=False):
        self.use_api = use_api
        if self.use_api:
            self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        else:
            logger.info("Loading local Whisper model (base)...")
            self.model = whisper.load_model("base")
            logger.info("Whisper model loaded.")

    def transcribe(self, audio_path):
        """Transcribe audio file to text."""
        if not os.path.exists(audio_path):
            logger.error(f"Audio file not found: {audio_path}")
            return ""

        try:
            if self.use_api:
                logger.debug("Transcribing via OpenAI API...")
                with open(audio_path, "rb") as audio_file:
                    transcript = self.client.audio.transcriptions.create(
                        model="whisper-1", 
                        file=audio_file
                    )
                return transcript.text
            else:
                logger.debug("Transcribing locally via Whisper...")
                result = self.model.transcribe(audio_path)
                return result["text"].strip()
        except Exception as e:
            logger.error(f"Error in STT transcription: {str(e)}")
            return ""

# Global instance
stt_engine = SpeechToText(use_api=False)  # Default to local for offline capability
