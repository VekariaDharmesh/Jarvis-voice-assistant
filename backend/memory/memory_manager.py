import json
import os
from backend.security.logger import logger

class MemoryManager:
    def __init__(self, memory_file="memory.json"):
        self.memory_file = os.path.join(os.path.dirname(__file__), memory_file)
        self.memory = self.load_memory()

    def load_memory(self):
        """Load memory from JSON file."""
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading memory: {e}")
                return self.default_memory()
        else:
            return self.default_memory()

    def default_memory(self):
        """Return the default memory schema."""
        return {
            "user": {
                "name": "Sir",
                "favorite_editor": "VS Code",
                "preferred_browser": "Chrome"
            },
            "facts": []
        }

    def save_memory(self):
        """Save memory to JSON file."""
        try:
            with open(self.memory_file, 'w') as f:
                json.dump(self.memory, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving memory: {e}")

    def add_fact(self, fact):
        """Add a general fact to memory."""
        if fact not in self.memory["facts"]:
            self.memory["facts"].append(fact)
            self.save_memory()
            logger.info(f"Memory updated with fact: {fact}")

    def delete_fact(self, index: int):
        """Delete a fact from memory by index."""
        if 0 <= index < len(self.memory["facts"]):
            removed = self.memory["facts"].pop(index)
            self.save_memory()
            logger.info(f"Memory removed fact: {removed}")
            return True
        return False

    def update_user_pref(self, key, value):
        """Update a user preference."""
        self.memory["user"][key] = value
        self.save_memory()
        logger.info(f"Memory updated preference: {key} = {value}")

    def get_context_string(self):
        """Return a string representation of memory for the LLM prompt."""
        context = "Current Knowledge about User:\n"
        context += f"- Name: {self.memory['user'].get('name', 'Sir')}\n"
        context += f"- Editor: {self.memory['user'].get('favorite_editor', 'Unknown')}\n"
        context += f"- Browser: {self.memory['user'].get('preferred_browser', 'Unknown')}\n"
        if self.memory["facts"]:
            context += "- Other facts:\n"
            for fact in self.memory["facts"]:
                context += f"  * {fact}\n"
        return context

# Global instance
memory_manager = MemoryManager()
