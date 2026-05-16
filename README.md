# Jarvis AI 🤖
### Personal Assistant & Automation Suite
**Modular OS Layer for macOS · Windows · Linux**
**Privacy-focused local execution (Ollama/Whisper) + Advanced Cloud Orchestration**

---

## 📌 What is Jarvis AI?
**Jarvis AI** is a professional-grade, modular personal assistant designed to act as an intelligent layer over your operating system. Unlike generic chatbots, Jarvis is deeply integrated with your system, allowing for voice-controlled automation, real-time telemetry, and autonomous task execution.

It combines the power of local AI (for privacy) with state-of-the-art cloud models to provide:
*   **Low-latency voice interaction** (Whisper + pyttsx3)
*   **Deep system automation** (Process management, app control, screen interaction)
*   **Contextual Memory** (Persistent storage of user preferences and history)
*   **Beautiful Dashboard** (Real-time monitoring and control)

---

## ✨ Main Features
*   **Multi-Engine Brain**: Seamlessly switch between local models (Ollama) and cloud APIs (OpenAI/Gemini).
*   **Voice Intelligence**: High-accuracy Speech-to-Text (STT) via Whisper and fast offline Text-to-Speech (TTS).
*   **Autonomous Tools**: Integrated tools for browser control, terminal execution, and system settings.
*   **Real-time Dashboard**: A premium, Gemini-inspired UI for visual feedback and manual control.
*   **Privacy First**: Local-first architecture for sensitive voice data and personal logs.
*   **Multimodal Ready**: Support for vision-based analysis and screen-aware automation.

---

## 🚀 Quick Start (most users)

### 1. Clone Repository
```bash
git clone https://github.com/VekariaDharmesh/Jarvis-personal-Ai.git
cd Jarvis-personal-Ai
```

### 2. Create Virtual Environment
**macOS / Linux**
```bash
python3 -m venv venv
source venv/bin/activate
```
**Windows**
```bash
python -m venv venv
.\venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
OLLAMA_HOST=http://localhost:11434
```

### 5. Run Application
**Start Dashboard (Server Mode)**
```bash
python3 backend/main.py --mode server
```
**Start Voice Loop (Interactive Mode)**
```bash
python3 backend/main.py --mode voice
```

Open Dashboard in browser:
`http://localhost:8000`

---

## 📂 Project Structure
```text
Jarvis-personal-Ai/
├── backend/
│   ├── app.py             # API Entry point
│   ├── main.py            # Main execution logic
│   ├── brain/             # LLM orchestration & Intent analysis
│   ├── automation/        # Tool management & system control
│   ├── voice/             # STT & TTS engines
│   ├── core/              # Config & Orchestrator
│   ├── memory/            # Persistent storage
│   └── security/          # Logging & Safety
├── frontend/
│   └── dashboard/         # HTML/CSS/JS UI
├── logs/                  # System logs
├── requirements.txt
└── README.md
```

---

## 🛠️ Full Setup Guide

### Requirements
*   **Python 3.9 – 3.11**
*   **FFmpeg** (Required for audio processing)
*   **Ollama** (Optional, for local LLM support)

### macOS Setup
```bash
brew install ffmpeg
```

### Windows Setup
1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html).
2. Add FFmpeg `bin` folder to your System PATH.

---

## 📜 Wake Words
Jarvis listens for the following triggers to activate:
*   **"Wake up Jarvis"**
*   **"Hey Jarvis"**
*   **"Daddy's home"** (Custom greeting)

---

## ⚠️ Notes & Limitations
*   **Admin Privileges**: System control tools (Terminal/Open App) may require elevated permissions.
*   **Microphone Access**: Ensure your terminal/IDE has permission to access the microphone.
*   **API Usage**: Cloud models (Gemini/OpenAI) require active internet and valid API keys.

---

## 🔮 Future Improvements
*   [ ] **iOS/Android Companion**: Mobile dashboard and remote trigger.
*   [ ] **Full Vision Integration**: Real-time screen analysis for visual tasks.
*   [ ] **Autonomous Web Agent**: Multi-step browser automation for complex research.
*   [ ] **Home Automation**: Integration with Home Assistant and smart devices.

---

## 📄 License
MIT License — Free to use, modify, and distribute.

---

## 👨‍💻 Author
**Dharmesh Vekaria**
Anand, Gujarat · 2025–2026

*Focused on building the next generation of personal AI operating systems.*

---
🛡️ **Stay Smart · Stay Automated**
