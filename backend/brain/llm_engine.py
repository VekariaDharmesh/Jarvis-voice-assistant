import json
import os
import datetime
from openai import OpenAI
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from backend.core.config import Config
from backend.security.logger import logger
from backend.automation.tool_manager import tool_manager
from backend.memory.memory_manager import memory_manager

class LLMEngine:
    def __init__(self):
        self.openai_client = None
        self.gemini_model = None
        self._initialize_engines()

        self.base_system_prompt = (
            "You are JARVIS, a highly advanced Personal AI Operating Layer. "
            "You are helpful, highly efficient, and have a sleek, professional, and slightly technical personality. "
            "Address the user with respect (using 'Sir' or their name), but maintain a friendly, hacker-engineer tone. "
            "Your responses should be concise but comprehensive when needed.\n\n"
            "OPERATING CONTEXT:\n"
            f"- Current Time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"- OS: macOS (Darwin)\n"
            f"- Environment: Production GUI Layer\n\n"
            "AGENTIC RULES:\n"
            "1. You have access to powerful system tools. If a task requires external action, use a tool.\n"
            "2. You can execute multiple tools in a sequence to solve complex problems.\n"
            "3. If a tool fails, analyze the error and try a different approach.\n"
            "4. NEVER just explain how to do something; ALWAYS do it for the user if a tool exists."
        )

    def _initialize_engines(self):
        """Initializes all available AI engines based on config."""
        # 1. Check Local LLM (Ollama)
        if Config.USE_LOCAL_LLM:
            try:
                # We don't check connection yet, just init the client
                self.local_client = OpenAI(
                    api_key="ollama",
                    base_url=Config.OLLAMA_BASE_URL
                )
                self.local_model = Config.LOCAL_MODEL_NAME
                logger.info(f"Local Engine Client Initialized (Ollama: {self.local_model}).")
            except Exception as e:
                logger.warning(f"Local Engine init failed: {e}")
                self.local_client = None

        # 2. Check OpenAI
        if Config.is_valid_key(Config.OPENAI_API_KEY):
            try:
                self.openai_client = OpenAI(api_key=Config.OPENAI_API_KEY)
                self.openai_model = "gpt-4-turbo-preview"
                logger.info("OpenAI Engine Initialized.")
            except Exception as e:
                logger.error(f"OpenAI init failed: {e}")

        # 3. Check Gemini
        if Config.is_valid_key(Config.GOOGLE_API_KEY):
            if genai:
                try:
                    genai.configure(api_key=Config.GOOGLE_API_KEY)
                    self.gemini_model = genai.GenerativeModel('gemini-1.5-pro')
                    logger.info("Gemini Engine Initialized.")
                except Exception as e:
                    logger.error(f"Gemini init failed: {e}")

    def _is_local_online(self):
        """Pings the Ollama server to check connectivity."""
        if not Config.USE_LOCAL_LLM or not hasattr(self, 'local_client'):
            return False
        import requests
        try:
            # Strip /v1 from URL if present for health check
            health_url = Config.OLLAMA_BASE_URL.replace("/v1", "")
            response = requests.get(health_url, timeout=2)
            return response.status_code == 200
        except:
            return False

    def generate_response(self, user_input, history=None):
        """Reasoning loop with provider fallback."""
        messages = self._prepare_messages(user_input, history)
        
        # Determine priority list of providers
        providers = []
        if Config.USE_LOCAL_LLM and self._is_local_online():
            providers.append(("Local", self.local_client, self.local_model))
        
        if self.openai_client:
            providers.append(("OpenAI", self.openai_client, self.openai_model))
            
        if self.gemini_model:
            providers.append(("Gemini", "gemini", None))

        if not providers:
            logger.warning("No functional AI providers available.")
            if Config.USE_LOCAL_LLM and not self._is_local_online():
                return "Sir, I cannot connect to your local Ollama server. Please ensure it is running at " + Config.OLLAMA_BASE_URL + " or provide a cloud API key in the .env file."
            return "Sir, my cognitive processors are offline. Please provide a valid OpenAI or Google API key to proceed."

        # Try providers in order
        for provider_name, client, model in providers:
            try:
                return self._execute_reasoning_loop(provider_name, client, model, messages, user_input)
            except Exception as e:
                logger.error(f"{provider_name} execution failed: {str(e)}")
                # Continue to next provider
                continue

        return "I apologize Sir, but all my neural engines have failed to respond. There might be a network or configuration issue."

    def _execute_reasoning_loop(self, provider_name, client, model, messages, user_input):
        """Runs the tool-use loop for a specific provider."""
        current_messages = list(messages) # Copy to avoid side effects between retries

        for step in range(5):
            if provider_name == "Gemini":
                # Simplified Gemini logic for now (no tool use implemented yet in this version)
                logger.info("Executing Gemini Fallback...")
                response = self.gemini_model.generate_content(user_input)
                return response.text
            
            # OpenAI-compatible providers (Ollama or OpenAI)
            response_message = client.chat.completions.create(
                model=model,
                messages=current_messages,
                tools=tool_manager.get_openai_tools() if provider_name != "Local" else None, # Disable tools for local if not supported
                tool_choice="auto" if provider_name != "Local" else None,
                temperature=0.7,
                max_tokens=800
            ).choices[0].message

            if response_message.tool_calls:
                current_messages.append(response_message)
                logger.info(f"JARVIS [{provider_name} Step {step+1}]: Executing tool(s).")
                
                for tool_call in response_message.tool_calls:
                    func_name = tool_call.function.name
                    func_args = json.loads(tool_call.function.arguments)
                    result = tool_manager.execute_tool(func_name, func_args)
                    
                    current_messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": func_name,
                        "content": str(result),
                    })
                continue
            else:
                return response_message.content

    def _prepare_messages(self, user_input, history):
        dynamic_prompt = f"{self.base_system_prompt}\n\nMEMORY CONTEXT:\n{memory_manager.get_context_string()}"
        messages = [{"role": "system", "content": dynamic_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_input})
        return messages

# Global instance
llm_engine = LLMEngine()
