import pyttsx3
import threading
import queue
import time
from backend.core.config import Config
from backend.security.logger import logger

class TextToSpeech:
    def __init__(self):
        self.speech_queue = queue.Queue()
        self.is_running = True
        # Start the worker thread
        self.worker_thread = threading.Thread(target=self._process_queue, daemon=True)
        self.worker_thread.start()
        logger.info("TTS Worker Thread initialized.")

    def _process_queue(self):
        """Internal worker to process speech requests in a dedicated thread."""
        try:
            # pyttsx3 engine MUST be initialized in the same thread that calls runAndWait
            engine = pyttsx3.init()
            
            # Setup Voice
            voices = engine.getProperty('voices')
            for voice in voices:
                if "Daniel" in voice.name or "Alex" in voice.name:
                    engine.setProperty('voice', voice.id)
                    break
            
            engine.setProperty('rate', Config.VOICE_RATE)
            engine.setProperty('volume', Config.VOICE_VOLUME)

            while self.is_running:
                try:
                    text = self.speech_queue.get(timeout=1)
                    if text:
                        logger.info(f"TTS Thread speaking: {text}")
                        # Clean text from markdown for better speech
                        clean_text = self._clean_markdown(text)
                        engine.say(clean_text)
                        engine.runAndWait()
                    self.speech_queue.task_done()
                except queue.Empty:
                    continue
                except Exception as e:
                    logger.error(f"Error in TTS Worker Loop: {str(e)}")
                    # Re-init engine if it crashes
                    try: engine = pyttsx3.init()
                    except: pass

        except Exception as e:
            logger.error(f"Critical failure in TTS Worker Thread: {str(e)}")

    def _clean_markdown(self, text):
        """Strip simple markdown characters for cleaner speech output."""
        import re
        # Remove bold/italic
        text = re.sub(r'[*_#]', '', text)
        # Remove code blocks
        text = re.sub(r'```.*?```', 'Code block omitted', text, flags=re.DOTALL)
        # Remove inline code
        text = re.sub(r'`.*?`', '', text)
        return text

    def speak(self, text, wait=False):
        """Convert text to speech. If wait is True, blocks until speech is finished."""
        if not text:
            return
        
        # Add to queue
        self.speech_queue.put(text)
        
        if wait:
            self.wait_until_done()

    def wait_until_done(self):
        """Block until all items in the queue are processed."""
        self.speech_queue.join()

    def stop(self):
        """Stop the worker thread."""
        self.is_running = False
        # Add a dummy item to wake up the worker
        self.speech_queue.put(None)
        self.worker_thread.join()

# Global instance
tts_engine = TextToSpeech()
