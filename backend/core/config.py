import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # AI Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

    # Local Offline AI Config
    USE_LOCAL_LLM = os.getenv("USE_LOCAL_LLM", "False").lower() == "true"
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
    LOCAL_MODEL_NAME = os.getenv("LOCAL_MODEL_NAME", "llama3")

    # Backend Config
    PORT = int(os.getenv("PORT", 8000))
    HOST = os.getenv("HOST", "0.0.0.0")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"

    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-it")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./jarvis.db")
    CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./memory/chroma_db")

    # Voice Settings
    VOICE_RATE = 175  # Speed of speech
    VOICE_VOLUME = 1.0  # Volume level (0.0 to 1.0)
    
    @staticmethod
    def is_valid_key(key: str) -> bool:
        """Checks if an API key is provided and not a placeholder."""
        if not key:
            return False
        placeholders = ["your_", "_here", "placeholder"]
        return not any(p in key.lower() for p in placeholders)

    @staticmethod
    def validate():
        """Ensure critical environment variables are set."""
        if not Config.is_valid_key(Config.OPENAI_API_KEY) and not Config.USE_LOCAL_LLM:
            print("WARNING: No valid AI provider key set. JARVIS may be limited.")

# Validate config on import
Config.validate()
