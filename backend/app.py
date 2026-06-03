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
        
        # Server-side speech disabled to prevent "dual voice" conflicts with browser TTS
        # background_tasks.add_task(tts_engine.speak, response)
        
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
        
        # Server-side speech disabled to prevent "dual voice" conflicts with browser TTS
        # background_tasks.add_task(tts_engine.speak, response)
        
        return ChatResponse(response=response, transcription=user_text)

    except Exception as e:
        logger.error(f"Voice API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

# --- DASHBOARD PERSISTENT DATA ENDPOINTS ---

import json

DASHBOARD_DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "memory", "dashboard_data.json")

def load_dashboard_data():
    if os.path.exists(DASHBOARD_DATA_FILE):
        try:
            with open(DASHBOARD_DATA_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading dashboard data: {e}")
    
    return {
        "projects": [
            {
                "id": "scholarweb",
                "name": "ScholarWeb",
                "lastUpdated": "2 hours ago",
                "status": "In Progress",
                "techStack": ["Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
                "progress": {
                    "Frontend": "completed",
                    "Backend": "in_progress",
                    "Database": "in_progress",
                    "Authentication": "pending",
                    "Deployment": "pending"
                }
            },
            {
                "id": "cloudcost",
                "name": "Cloud Cost Tracker",
                "lastUpdated": "2 days ago",
                "status": "Completed",
                "techStack": ["React", "Python", "FastAPI", "AWS"],
                "progress": {
                    "Frontend": "completed",
                    "Backend": "completed",
                    "Database": "completed",
                    "Authentication": "completed",
                    "Deployment": "completed"
                }
            },
            {
                "id": "portfolio",
                "name": "Portfolio Website",
                "lastUpdated": "1 week ago",
                "status": "Completed",
                "techStack": ["HTML", "CSS", "JavaScript"],
                "progress": {
                    "Frontend": "completed",
                    "Deployment": "completed"
                }
            }
        ],
        "tasks": [
            {"id": "task-1", "title": "Landing Page Design", "status": "completed"},
            {"id": "task-2", "title": "Login API Integration", "status": "in_progress"},
            {"id": "task-3", "title": "Database Schema Setup", "status": "in_progress"},
            {"id": "task-4", "title": "Deployment Pipeline", "status": "pending"}
        ],
        "notes": "### ScholarWeb Goals\n- Redesign dashboard front-end\n- Set up PostgreSQL schema\n- Connect auth logic"
    }

def save_dashboard_data(data):
    try:
        os.makedirs(os.path.dirname(DASHBOARD_DATA_FILE), exist_ok=True)
        with open(DASHBOARD_DATA_FILE, "w") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        logger.error(f"Error saving dashboard data: {e}")

AGENTS_PERSONAS = {
    "Frontend Engineer": "You are a professional Frontend Engineer. You specialize in clean, responsive interfaces, premium design systems (Linear/Vercel inspired), and Vanilla JS/React. You provide production-ready HTML, CSS, and JS components.",
    "Backend Engineer": "You are an expert Backend Engineer. You design robust, scalable microservices, restful APIs using FastAPI/Node.js, secure authentication models, and efficient background worker tasks.",
    "UI/UX Designer": "You are a Senior UI/UX Designer. You specialize in clean layouts, minimal spacing, premium typography (Inter/JetBrains Mono), and modern functional SaaS design systems (Notion/Linear/Raycast).",
    "Database Architect": "You are a Database Architect. You specialize in highly optimized SQL database design (PostgreSQL/SQLite), transactional integrity, performance indexing, and complex relationship mapping.",
    "DevOps Engineer": "You are a Senior DevOps Engineer. You build fast, modern CI/CD pipelines, containerize projects with Docker, and configure zero-downtime deployments on Vercel, AWS, or GCP.",
    "Cloud Engineer": "You are a Cloud Engineer. You specialize in AWS/serverless architectures, robust distributed queues, API gateways, and cost optimization telemetry.",
    "Technical Writer": "You are a Technical Writer. You create structured, comprehensive documentation, API references, clean READMEs, and developer walkthrough guides."
}

class AgentRequest(BaseModel):
    name: str

class ProjectItem(BaseModel):
    id: str
    name: str
    lastUpdated: str
    status: str
    techStack: list
    progress: dict

class TaskItem(BaseModel):
    id: str
    title: str
    status: str

class NotesRequest(BaseModel):
    content: str

@app.get("/api/dashboard")
async def get_dashboard():
    """Retrieve full dashboard data including projects, tasks, and notes."""
    return load_dashboard_data()

@app.post("/api/projects")
async def save_project(project: ProjectItem):
    """Save or update a project."""
    data = load_dashboard_data()
    # Find existing project
    updated = False
    for i, p in enumerate(data["projects"]):
        if p["id"] == project.id:
            data["projects"][i] = project.dict()
            updated = True
            break
    if not updated:
        data["projects"].append(project.dict())
    save_dashboard_data(data)
    return {"status": "success", "message": "Project saved successfully"}

@app.delete("/api/projects/{proj_id}")
async def delete_project(proj_id: str):
    """Delete a project."""
    data = load_dashboard_data()
    data["projects"] = [p for p in data["projects"] if p["id"] != proj_id]
    save_dashboard_data(data)
    return {"status": "success", "message": "Project deleted successfully"}

@app.get("/api/tasks")
async def get_tasks():
    """Get all tasks."""
    return load_dashboard_data()["tasks"]

@app.post("/api/tasks")
async def save_task(task: TaskItem):
    """Add or update a task."""
    data = load_dashboard_data()
    updated = False
    for i, t in enumerate(data["tasks"]):
        if t["id"] == task.id:
            data["tasks"][i] = task.dict()
            updated = True
            break
    if not updated:
        data["tasks"].append(task.dict())
    save_dashboard_data(data)
    return {"status": "success", "message": "Task saved successfully"}

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task."""
    data = load_dashboard_data()
    data["tasks"] = [t for t in data["tasks"] if t["id"] != task_id]
    save_dashboard_data(data)
    return {"status": "success", "message": "Task deleted successfully"}

@app.post("/api/notes")
async def save_notes(notes: NotesRequest):
    """Save notes scratchpad content."""
    data = load_dashboard_data()
    data["notes"] = notes.content
    save_dashboard_data(data)
    return {"status": "success", "message": "Notes updated successfully"}

@app.post("/api/agent/activate")
async def activate_agent(req: AgentRequest):
    """Set the active LLM developer persona agent."""
    from backend.brain.llm_engine import llm_engine
    if req.name in AGENTS_PERSONAS:
        llm_engine.active_agent = AGENTS_PERSONAS[req.name]
        logger.info(f"Agent persona '{req.name}' activated.")
        return {"status": "success", "message": f"Persona '{req.name}' successfully activated."}
    else:
        llm_engine.active_agent = None
        logger.info("Default Jarvis persona activated.")
        return {"status": "success", "message": "Default persona restored."}

@app.get("/api/agent/current")
async def get_current_agent():
    """Retrieve the currently active agent persona name."""
    from backend.brain.llm_engine import llm_engine
    current_persona = llm_engine.active_agent
    for name, prompt in AGENTS_PERSONAS.items():
        if prompt == current_persona:
            return {"active_agent": name}
    return {"active_agent": "Default"}

class MemoryFactRequest(BaseModel):
    fact: str

@app.get("/api/memory")
async def get_memory():
    """Retrieve user context and list of facts."""
    from backend.memory.memory_manager import memory_manager
    return memory_manager.memory

@app.post("/api/memory")
async def add_memory_fact(req: MemoryFactRequest):
    """Add a fact to memory."""
    from backend.memory.memory_manager import memory_manager
    memory_manager.add_fact(req.fact)
    return {"status": "success", "message": "Fact added to memory successfully"}

@app.delete("/api/memory/{index}")
async def delete_memory_fact(index: int):
    """Delete a fact from memory by index."""
    from backend.memory.memory_manager import memory_manager
    success = memory_manager.delete_fact(index)
    if success:
        return {"status": "success", "message": "Fact removed from memory successfully"}
    raise HTTPException(status_code=400, detail="Invalid fact index")

# Serve static files at the root level for relative paths
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=Config.HOST, port=Config.PORT)
