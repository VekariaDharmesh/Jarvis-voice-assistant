import subprocess
from backend.security.logger import logger

def open_application(app_name: str) -> str:
    """
    Opens an application on macOS using the 'open -a' command.
    """
    logger.info(f"Tool Execution: Opening application '{app_name}'")
    try:
        # On macOS, 'open -a' attempts to find and launch the app
        subprocess.run(["open", "-a", app_name], check=True, capture_output=True, text=True)
        return f"Successfully opened {app_name}."
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to open application {app_name}: {e.stderr}")
        return f"Failed to open {app_name}. Please make sure the application name is correct."
    except Exception as e:
        logger.error(f"Unexpected error opening application {app_name}: {e}")
        return f"An unexpected error occurred while trying to open {app_name}."
