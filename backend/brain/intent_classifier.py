import re
from enum import Enum

class Intent(Enum):
    OPEN_APP = "open_application"
    WEB_SEARCH = "web_search"
    SAVE_MEMORY = "save_memory"
    QUERY_CAPABILITIES = "capability_query"
    SYSTEM_COMMAND = "system_command"
    DATETIME = "datetime"
    BATTERY_STATUS = "battery_status"
    SET_VOLUME = "set_volume"
    LOCK_SCREEN = "lock_screen"
    MEDIA_CONTROL = "media_control"
    CONVERSATION = "conversation"
    UNKNOWN = "unknown"

class IntentClassifier:
    def __init__(self):
        # Patterns for fast, rule-based classification
        self.patterns = {
            Intent.OPEN_APP: [
                r"open\s+(.+)",
                r"launch\s+(.+)",
                r"start\s+(.+)"
            ],
            Intent.WEB_SEARCH: [
                r"search\s+(?:the\s+)?web\s+for\s+(.+)",
                r"google\s+(.+)",
                r"search\s+for\s+(.+)"
            ],
            Intent.SAVE_MEMORY: [
                r"remember\s+that\s+(.+)",
                r"save\s+this\s+info:\s+(.+)",
                r"my\s+(.+)\s+is\s+(.+)"
            ],
            Intent.QUERY_CAPABILITIES: [
                r"what\s+can\s+you\s+do",
                r"what\s+are\s+your\s+abilities",
                r"help\s+me",
                r"capabilities"
            ],
            Intent.SYSTEM_COMMAND: [
                r"run\s+command\s+(.+)",
                r"terminal\s+(.+)",
                r"execute\s+(.+)"
            ],
            Intent.DATETIME: [
                r"what\s+time\s+is\s+it",
                r"what\s+is\s+the\s+time",
                r"tell\s+me\s+the\s+time",
                r"whats?\s+the\s+time",
                r"current\s+time",
                r"whats?\s+the\s+date",
                r"what\s+day\s+is\s+it",
                r"what\s+is\s+today's\s+date",
                r"whats?\s+today's\s+date",
                r"current\s+date",
                r"date\s+today"
            ],
            Intent.BATTERY_STATUS: [
                r"battery\s+status",
                r"battery\s+level",
                r"how\s+much\s+battery",
                r"check\s+battery"
            ],
            Intent.SET_VOLUME: [
                r"set\s+volume\s+to\s+(\d+)",
                r"change\s+volume\s+to\s+(\d+)",
                r"volume\s+(\d+)",
                r"mute",
                r"unmute",
                r"volume\s+up",
                r"volume\s+down"
            ],
            Intent.LOCK_SCREEN: [
                r"lock\s+screen",
                r"lock\s+my\s+mac",
                r"lock\s+the\s+computer",
                r"go\s+to\s+sleep"
            ],
            Intent.MEDIA_CONTROL: [
                r"(play|pause|resume|stop).*\s+music",
                r"(next|previous).*\s+track",
                r"skip.*\s+song"
            ]
        }

    def classify(self, user_input: str):
        """
        Classifies the user input into an Intent and extracts key entities.
        """
        user_input = user_input.lower().strip()

        for intent, patterns in self.patterns.items():
            for pattern in patterns:
                match = re.search(pattern, user_input)
                if match:
                    # Extract the primary group as the 'entity'
                    entity = match.group(1) if match.groups() else None
                    return intent, entity

        # Default to conversation if no specific patterns match
        return Intent.CONVERSATION, None

# Global instance
intent_classifier = IntentClassifier()
