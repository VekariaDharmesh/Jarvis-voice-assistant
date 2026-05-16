import subprocess
import datetime
from backend.security.logger import logger

def set_volume(level: int):
    """Sets the macOS system volume (0 to 100)."""
    try:
        level = max(0, min(100, int(level)))
        # osascript volume goes from 0 to 100
        cmd = f"osascript -e 'set volume output volume {level}'"
        subprocess.run(cmd, shell=True, check=True)
        return f"System volume set to {level}%."
    except Exception as e:
        logger.error(f"Failed to set volume: {e}")
        return f"Error setting volume: {e}"

def get_battery_status():
    """Retrieves the current macOS battery percentage and charging status."""
    try:
        result = subprocess.run(["pmset", "-g", "batt"], capture_output=True, text=True, check=True)
        output = result.stdout
        if "InternalBattery" not in output:
            return "No battery detected (likely a desktop Mac)."
        
        # Parse pmset output. e.g. " -InternalBattery-0 (id=123) 100%; charged; 0:00 remaining present: true"
        lines = output.strip().split('\n')
        if len(lines) > 1:
            status_line = lines[1]
            return f"Battery status: {status_line.split(';')[0].split('\t')[-1]};{status_line.split(';')[1]}."
        return output
    except Exception as e:
        logger.error(f"Failed to get battery status: {e}")
        return f"Error getting battery status: {e}"

def lock_screen():
    """Locks the macOS screen."""
    try:
        # Command to lock screen in modern macOS
        cmd = "/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend"
        subprocess.run(cmd, shell=True)
        # Fallback to pmset
        subprocess.run(["pmset", "displaysleepnow"])
        return "Screen locked."
    except Exception as e:
        logger.error(f"Failed to lock screen: {e}")
        return f"Error locking screen: {e}"

def get_datetime(format_type: str = "full"):
    """Returns the current date and/or time."""
    now = datetime.datetime.now()
    if format_type == "time":
        return f"The current time is {now.strftime('%I:%M %p')}."
    elif format_type == "date":
        return f"Today's date is {now.strftime('%B %d, %Y')}."
    else:
        return f"It is currently {now.strftime('%I:%M %p on %A, %B %d, %Y')}."

def media_control(action: str, player: str = "Spotify"):
    """Controls media playback via AppleScript."""
    valid_actions = ["playpause", "next track", "previous track"]
    if action not in valid_actions:
        return f"Invalid action. Supported actions: {valid_actions}"
    
    try:
        cmd = f"osascript -e 'tell application \"{player}\" to {action}'"
        subprocess.run(cmd, shell=True, check=True)
        return f"Executed '{action}' on {player}."
    except Exception as e:
        logger.error(f"Failed to control media: {e}")
        return f"Error controlling media. Make sure {player} is open. ({e})"
