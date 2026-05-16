class CapabilitySystem:
    def __init__(self):
        self.capabilities = [
            {
                "name": "Application Control",
                "description": "Open any macOS application by name.",
                "examples": ["Open Chrome", "Launch Spotify"]
            },
            {
                "name": "Web Intelligence",
                "description": "Search the web and extract real-time information.",
                "examples": ["Search for latest AI news", "Who won the game yesterday?"]
            },
            {
                "name": "Terminal Access",
                "description": "Execute shell commands and manage local files.",
                "examples": ["List files in Downloads", "Create a new directory called 'Projects'"]
            },
            {
                "name": "Persistent Memory",
                "description": "Remember facts about you and your preferences.",
                "examples": ["Remember that my favorite IDE is VS Code", "Which editor do I like?"]
            },
            {
                "name": "System Monitoring",
                "description": "Track CPU, Memory, and System Health in real-time.",
                "examples": ["Check system health", "How is my CPU doing?"]
            }
        ]

    def get_formatted_capabilities(self):
        """Returns a human-readable string of all capabilities."""
        response = "Sir, here are my current operational capabilities:\n\n"
        for cap in self.capabilities:
            response += f"🔹 **{cap['name']}**: {cap['description']}\n"
            response += f"   _e.g., {', '.join(cap['examples'])}_\n\n"
        return response

# Global instance
capability_system = CapabilitySystem()
