import sys
import os
import argparse

# Add the project root to sys.path to allow relative imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.orchestrator import orchestrator
from backend.voice.speech_to_text import stt_engine
from backend.voice.text_to_speech import tts_engine
from backend.voice.microphone import mic
from backend.security.logger import logger
from backend.core.config import Config

class Jarvis:
    def __init__(self):
        self.is_running = True
        self.is_awake = False # Start in passive mode
        self.history = []
        self.wake_words = ["wake up jarvis", "daddy's home", "daddys home", "hey jarvis", "hello jarvis"]
        self.sleep_words = ["go to sleep", "sleep now", "standby mode"]

    def run_voice_loop(self):
        """Main voice interaction loop for Jarvis."""
        logger.info("Jarvis AI Voice System Online. Waiting for wake word...")
        
        # Initial greeting when first started
        tts_engine.speak("Jarvis AI systems online. Standing by.", wait=True)

        try:
            while self.is_running:
                # 1. Listen
                # Short duration for wake-word detection to be more responsive
                listen_duration = 3 if not self.is_awake else 5
                audio_file = mic.record(duration=listen_duration)
                
                # 2. Transcribe
                user_text = stt_engine.transcribe(audio_file)
                mic.cleanup()

                if not user_text:
                    continue

                user_text_lower = user_text.lower().strip()
                logger.info(f"Detected: {user_text_lower}")

                # --- WAKE WORD LOGIC ---
                if not self.is_awake:
                    if any(word in user_text_lower for word in self.wake_words):
                        self.is_awake = True
                        logger.info("Jarvis AI Awoken.")
                        if "daddy" in user_text_lower:
                            tts_engine.speak("Welcome home, Sir. All systems are at your disposal.", wait=True)
                        else:
                            tts_engine.speak("At your service, Sir. How can I help?", wait=True)
                        continue
                    else:
                        # Still sleeping, ignore other talk
                        continue
                
                # --- ACTIVE MODE LOGIC ---
                
                # Check for sleep command
                if any(word in user_text_lower for word in self.sleep_words):
                    self.is_awake = False
                    logger.info("Jarvis AI entering standby mode.")
                    tts_engine.speak("Understood. Standing by if you need me.", wait=True)
                    continue

                # Check for exit commands
                if any(word in user_text_lower for word in ["exit", "shut down", "goodbye jarvis"]):
                    tts_engine.speak("Terminating all systems. Have a productive day, Sir.", wait=True)
                    self.is_running = False
                    break

                # 3. Think (Orchestration)
                response = orchestrator.process_query(user_text, self.history)
                
                # Update history
                self.history.append({"role": "user", "content": user_text})
                self.history.append({"role": "assistant", "content": response})

                if len(self.history) > 20:
                    self.history = self.history[-20:]

                # 4. Speak
                tts_engine.speak(response, wait=True)

        except KeyboardInterrupt:
            logger.info("Jarvis AI manually interrupted.")
        except Exception as e:
            logger.error(f"Critical error in voice loop: {str(e)}")
        finally:
            logger.info("Jarvis AI Voice System Offline.")

    def run_server(self):
        """Starts the FastAPI server for the GUI."""
        import uvicorn
        from backend.app import app
        logger.info(f"Starting Jarvis AI API Server on {Config.HOST}:{Config.PORT}")
        uvicorn.run(app, host=Config.HOST, port=Config.PORT)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="JARVIS AI Assistant")
    parser.add_argument("--mode", type=str, default="voice", choices=["voice", "server"], 
                        help="Mode to run JARVIS in: 'voice' (CLI/Voice loop) or 'server' (API for GUI)")
    
    args = parser.parse_args()
    
    jarvis = Jarvis()
    
    if args.mode == "server":
        jarvis.run_server()
    else:
        jarvis.run_voice_loop()

