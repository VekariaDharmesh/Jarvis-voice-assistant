# Jarvis AI - Personal Operating System

A modular, scalable, and professional-grade AI assistant designed as a modern operating system layer.

## 🚀 Features
- **Minimalist Dashboard**: A premium, Gemini-inspired UI with real-time telemetry.
*   **Jarvis Brain**: A multi-provider orchestrator (Ollama / OpenAI / Gemini).
- **Voice STT**: Using Whisper for high-accuracy local speech-to-text.
- **Voice TTS**: Offline, fast speech synthesis.
- **Wake Word Detection**: Responds to "Wake up Jarvis" and "Daddy's home".
- **System Automation**: Direct control over macOS apps and system settings.

## 🛠️ Tech Stack
- **Backend**: Python, FastAPI
- **AI**: Whisper, Ollama, GPT-4
- **Voice**: pyttsx3, sounddevice
- **Frontend**: Vanilla JS, Glassmorphism CSS, Lucide Icons

## ⚙️ Quick Start
1. **Install Dependencies**: `pip install -r requirements.txt`
2. **Run Server (GUI)**: `python3 backend/main.py --mode server`
3. **Run Voice Loop (CLI)**: `python3 backend/main.py --mode voice`

## 📜 Wake Words
- "Wake up Jarvis"
- "Hey Jarvis"
- "Daddy's home"

---
*Project rebranded back to Jarvis AI.*
