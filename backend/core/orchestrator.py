from backend.brain.intent_classifier import intent_classifier
from backend.brain.task_router import TaskRouter
from backend.brain.llm_engine import llm_engine
from backend.security.logger import logger
from backend.memory.memory_manager import memory_manager

class Orchestrator:
    def __init__(self):
        self.router = TaskRouter(llm_engine)
        logger.info("JARVIS Orchestrator Initialized.")

    def process_query(self, user_input: str, history=None):
        """
        The main pipeline: Intent -> Route -> Execute -> Response.
        """
        logger.info(f"Orchestrator received query: {user_input}")

        # 1. Classify Intent
        intent, entity = intent_classifier.classify(user_input)
        
        # 2. Route and Execute
        # Note: If it's a conversation, the router will hand it to the LLMEngine
        response = self.router.route(intent, entity, user_input, history)

        # 3. Add to Memory (Internal logging of interactions could happen here)
        # For now, memory is updated via specific tools (remember_fact)

        return response

# Global instance
orchestrator = Orchestrator()
