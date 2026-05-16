import sounddevice as sd
import soundfile as sf
import os
import time
from backend.security.logger import logger

class Microphone:
    def __init__(self):
        self.channels = 1
        self.rate = 16000
        self.temp_file = "temp_audio.wav"

    def record(self, duration=15):
        """Record audio for a fixed duration."""
        logger.info(f"Listening for {duration} seconds...")
        
        # Record audio using sounddevice
        recording = sd.rec(int(duration * self.rate), samplerate=self.rate, channels=self.channels, dtype='int16')
        sd.wait()  # Wait until recording is finished

        logger.info("Recording finished.")

        # Save to file using soundfile
        sf.write(self.temp_file, recording, self.rate)

        return self.temp_file

    def cleanup(self):
        """Delete temporary audio file."""
        if os.path.exists(self.temp_file):
            os.remove(self.temp_file)

# Global instance
mic = Microphone()
