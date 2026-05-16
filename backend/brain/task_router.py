from backend.brain.intent_classifier import Intent
from backend.automation.tool_manager import tool_manager
from backend.memory.memory_manager import memory_manager
from backend.security.logger import logger

class TaskRouter:
    def __init__(self, llm_engine):
        self.llm_engine = llm_engine

    def route(self, intent, entity, user_input, history=None):
        """
        Routes the intent to the appropriate tool or the LLM Brain.
        """
        logger.info(f"Routing Intent: {intent} (Entity: {entity})")

        try:
            if intent == Intent.OPEN_APP:
                return tool_manager.execute_tool("open_application", {"app_name": entity})

            elif intent == Intent.WEB_SEARCH:
                return tool_manager.execute_tool("search_web", {"query": entity})

            elif intent == Intent.SAVE_MEMORY:
                return tool_manager.execute_tool("remember_fact", {"fact": entity})

            elif intent == Intent.QUERY_CAPABILITIES:
                from backend.core.capabilities import capability_system
                return capability_system.get_formatted_capabilities()

            elif intent == Intent.SYSTEM_COMMAND:
                return tool_manager.execute_tool("execute_shell_command", {"command": entity})

            elif intent == Intent.DATETIME:
                # determine format from user input if possible
                fmt = "date" if "date" in user_input.lower() or "day" in user_input.lower() else "time"
                if "time" in user_input.lower() and "date" in user_input.lower(): fmt = "full"
                return tool_manager.execute_tool("get_datetime", {"format_type": fmt})

            elif intent == Intent.BATTERY_STATUS:
                return tool_manager.execute_tool("get_battery_status", {})

            elif intent == Intent.SET_VOLUME:
                return tool_manager.execute_tool("set_volume", {"level": int(entity) if entity else 50})

            elif intent == Intent.LOCK_SCREEN:
                return tool_manager.execute_tool("lock_screen", {})

            elif intent == Intent.MEDIA_CONTROL:
                # Basic mapping
                action = "playpause"
                if "next" in user_input.lower() or "skip" in user_input.lower(): action = "next track"
                if "previous" in user_input.lower(): action = "previous track"
                return tool_manager.execute_tool("media_control", {"action": action})

            elif intent == Intent.CONVERSATION:
                # Fall back to the LLM for reasoning
                return self.llm_engine.generate_response(user_input, history)

            else:
                return "Sir, I'm not quite sure how to handle that intent yet. Should I try reasoning through it?"

        except Exception as e:
            logger.error(f"Routing Error: {str(e)}")
            return f"I apologize Sir, but I encountered an error during task routing: {str(e)}"

# Global instance will be created in the orchestrator to avoid circular imports
