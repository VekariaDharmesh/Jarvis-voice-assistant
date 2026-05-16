import json
from backend.automation.tools.open_app import open_application
from backend.automation.tools.browser_tool import open_url, search_web
from backend.automation.tools.terminal_tool import execute_shell_command
from backend.memory.memory_manager import memory_manager
from backend.security.logger import logger
from backend.automation.tools.system_control import set_volume, get_battery_status, lock_screen, get_datetime, media_control
from backend.automation.tools.vision_tool import analyze_visual_content
from backend.automation.tools.screen_control_tool import screen_control

class ToolManager:
    def __init__(self):
        # Map tool names to python functions
        self.tool_map = {
            "open_application": open_application,
            "open_url": open_url,
            "search_web": search_web,
            "execute_shell_command": execute_shell_command,
            "remember_fact": memory_manager.add_fact,
            "update_preference": memory_manager.update_user_pref,
            "set_volume": set_volume,
            "get_battery_status": get_battery_status,
            "lock_screen": lock_screen,
            "get_datetime": get_datetime,
            "media_control": media_control,
            "analyze_visual_content": analyze_visual_content,
            "screen_control": screen_control
        }

    def execute_tool(self, tool_name: str, arguments: dict) -> str:
        """
        Executes a mapped tool with the provided arguments.
        """
        if tool_name not in self.tool_map:
            logger.error(f"Attempted to execute unknown tool: {tool_name}")
            return f"Error: Tool '{tool_name}' not found."

        try:
            func = self.tool_map[tool_name]
            result = func(**arguments)
            # Memory tools might not return a string, so we handle that
            if result is None:
                return f"Successfully executed {tool_name}."
            return str(result)
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}")
            return f"Error executing tool {tool_name}: {str(e)}"

    def get_openai_tools(self):
        """
        Returns the JSON schema definitions of tools for the OpenAI API.
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": "open_application",
                    "description": "Opens a macOS application by its name (e.g. 'Google Chrome', 'Visual Studio Code', 'Notes', 'Spotify').",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "app_name": {
                                "type": "string",
                                "description": "The exact name of the application to open."
                            }
                        },
                        "required": ["app_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_web",
                    "description": "Performs a web search in the user's default browser.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The search query to look up on the web."
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "execute_shell_command",
                    "description": "Executes a bash/zsh shell command on the user's local macOS machine. Use this to find files, manipulate the file system, or run scripts. Make sure the commands are non-interactive.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "command": {
                                "type": "string",
                                "description": "The shell command to execute."
                            }
                        },
                        "required": ["command"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "remember_fact",
                    "description": "Saves a long-term fact or piece of information about the user so Jarvis can remember it for future conversations.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "fact": {
                                "type": "string",
                                "description": "The clear, concise fact to remember (e.g. 'User has a dog named Max')."
                            }
                        },
                        "required": ["fact"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "set_volume",
                    "description": "Sets the macOS system volume.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "level": {
                                "type": "integer",
                                "description": "The volume level to set, from 0 to 100."
                            }
                        },
                        "required": ["level"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_battery_status",
                    "description": "Retrieves the current macOS battery percentage and charging status.",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "lock_screen",
                    "description": "Locks the macOS screen.",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_datetime",
                    "description": "Returns the current date and/or time.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "format_type": {
                                "type": "string",
                                "enum": ["full", "time", "date"],
                                "description": "The format to return the date/time in."
                            }
                        },
                        "required": ["format_type"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "media_control",
                    "description": "Controls media playback via AppleScript.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "action": {
                                "type": "string",
                                "enum": ["playpause", "next track", "previous track"],
                                "description": "The action to perform on the media player."
                            },
                            "player": {
                                "type": "string",
                                "description": "The name of the media player to control (e.g. 'Spotify', 'Music'). Default is 'Spotify'."
                            }
                        },
                        "required": ["action"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "analyze_visual_content",
                    "description": "Captures the user's screen or camera and answers a question about what is seen. Use this to scan documents, analyze images, or identify what's on the screen.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "question": {
                                "type": "string",
                                "description": "The specific question or information to look for in the visual content (e.g. 'What does this document say?', 'What colors are on my screen?')."
                            },
                            "source": {
                                "type": "string",
                                "enum": ["screen", "camera"],
                                "description": "The source to capture from. 'screen' for current computer screen, 'camera' for the user's webcam."
                            }
                        },
                        "required": ["question"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "screen_control",
                    "description": "Automates mouse and keyboard actions. Use this for direct screen control like clicking buttons, typing text, or scrolling.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "action": {
                                "type": "string",
                                "enum": ["click", "move", "type", "press", "scroll"],
                                "description": "The specific automation action to perform."
                            },
                            "x": {
                                "type": "integer",
                                "description": "The X coordinate for mouse actions (move, click)."
                            },
                            "y": {
                                "type": "integer",
                                "description": "The Y coordinate for mouse actions (move, click)."
                            },
                            "text": {
                                "type": "string",
                                "description": "The text to type for the 'type' action."
                            },
                            "key": {
                                "type": "string",
                                "description": "The special key to press (e.g. 'enter', 'tab', 'esc') for the 'press' action."
                            }
                        },
                        "required": ["action"]
                    }
                }
            }
        ]

# Global instance
tool_manager = ToolManager()
