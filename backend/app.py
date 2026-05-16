from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import sys
import os
import psutil
import time
import shutil

# Add the project root to sys.path to allow relative imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.orchestrator import orchestrator
from backend.voice.speech_to_text import stt_engine
from backend.voice.text_to_speech import tts_engine
from backend.security.logger import logger
from backend.core.config import Config

app = FastAPI(title="Jarvis AI API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the frontend dashboard
frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dashboard")
app.mount("/dashboard_files", StaticFiles(directory=frontend_path), name="dashboard")

@app.get("/")
async def root():
    return FileResponse(os.path.join(frontend_path, "index.html"))

class ChatRequest(BaseModel):
    message: str
    history: list = []

class ChatResponse(BaseModel):
    response: str
    transcription: str = ""
    status: str = "success"

@app.get("/api/status")
async def get_status():
    """Returns system health metrics."""
    return {
        "status": "online",
        "cpu_usage": psutil.cpu_percent(),
        "memory_usage": psutil.virtual_memory().percent,
        "timestamp": time.time()
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    """Handles chat messages from the frontend via the Orchestrator."""
    try:
        logger.info(f"API Request: {request.message}")
        response = orchestrator.process_query(request.message, request.history)
        
        # Speak in background
        background_tasks.add_task(tts_engine.speak, response)
        
        return ChatResponse(response=response)
    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice", response_model=ChatResponse)
async def voice_command(background_tasks: BackgroundTasks, audio: UploadFile = File(...)):
    """Receives audio, transcribes, and executes command."""
    temp_audio_path = f"temp_voice_{time.time()}.wav"
    try:
        # 1. Save uploaded blob to temp file
        logger.info(f"Voice API: Received file {audio.filename}")
        with open(temp_audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        file_size = os.path.getsize(temp_audio_path)
        logger.info(f"Voice API: Saved temp file ({file_size} bytes)")

        if file_size < 100:
            logger.warning("Voice API: Received file is too small (likely empty).")
            return ChatResponse(response="Sir, the audio stream was empty. Please check your mic.", transcription="", status="error")

        # 2. Transcribe
        logger.info("Voice API: Starting transcription...")
        user_text = stt_engine.transcribe(temp_audio_path)
        
        if not user_text:
            logger.warning("Voice API: Transcription returned empty text.")
            return ChatResponse(response="Sir, I couldn't quite hear that. Could you repeat?", transcription="", status="error")
        
        logger.info(f"Voice Request (Transcribed): {user_text}")
        
        # 3. Process
        response = orchestrator.process_query(user_text)
        
        # 4. Speak in background
        background_tasks.add_task(tts_engine.speak, response)
        
        return ChatResponse(response=response, transcription=user_text)

    except Exception as e:
        logger.error(f"Voice API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=Config.HOST, port=Config.PORT)
