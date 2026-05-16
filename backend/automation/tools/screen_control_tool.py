import pyautogui
import time
from backend.security.logger import logger

# Safety setting for pyautogui
pyautogui.PAUSE = 0.5
pyautogui.FAILSAFE = True

def screen_control(action: str, x: int = None, y: int = None, text: str = None, key: str = None) -> str:
    """
    Automates mouse and keyboard actions on the computer.
    
    Args:
        action: The action to perform ('click', 'move', 'type', 'press', 'scroll').
        x, y: Coordinates for mouse actions.
        text: Text to type for the 'type' action.
        key: Key to press for the 'press' action (e.g. 'enter', 'esc', 'space').
    """
    logger.info(f"Tool Execution: Screen Control - {action} (x={x}, y={y}, text={text}, key={key})")
    
    try:
        if action == "move":
            if x is None or y is None:
                return "Error: Coordinates (x, y) are required for 'move' action."
            pyautogui.moveTo(x, y, duration=0.5)
            return f"Moved mouse to ({x}, {y})."
        
        elif action == "click":
            if x is not None and y is not None:
                pyautogui.click(x, y)
                return f"Clicked at ({x}, {y})."
            else:
                pyautogui.click()
                return "Performed mouse click at current position."
        
        elif action == "type":
            if not text:
                return "Error: 'text' is required for 'type' action."
            pyautogui.write(text, interval=0.1)
            return f"Typed text: '{text}'"
        
        elif action == "press":
            if not key:
                return "Error: 'key' is required for 'press' action."
            pyautogui.press(key)
            return f"Pressed key: '{key}'"
        
        elif action == "scroll":
            # pyautogui.scroll(10) scrolls up 10 clicks
            # We can use x as the amount if provided
            amount = x if x is not None else 10
            pyautogui.scroll(amount)
            return f"Scrolled by {amount} units."
        
        else:
            return f"Error: Invalid action '{action}'. Supported: move, click, type, press, scroll."

    except Exception as e:
        logger.error(f"Screen control failed: {e}")
        return f"Error during screen control: {str(e)}"
