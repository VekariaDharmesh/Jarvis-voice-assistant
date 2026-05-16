import subprocess
from backend.security.logger import logger

def execute_shell_command(command: str) -> str:
    """
    Executes a shell command on the host operating system.
    Security Warning: In a full production build, this would run in a sandbox or require explicit user confirmation.
    """
    logger.info(f"Tool Execution: Running shell command '{command}'")
    
    # Basic rudimentary protection against dangerous commands
    dangerous_keywords = ["rm -rf /", "mkfs", "> /dev/sda"]
    if any(keyword in command for keyword in dangerous_keywords):
        logger.warning(f"Blocked dangerous command: {command}")
        return "Command execution blocked due to security restrictions."

    try:
        # Run command with a timeout to prevent hanging
        result = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            capture_output=True, 
            text=True,
            timeout=15
        )
        output = result.stdout.strip()
        if not output:
            output = "Command executed successfully with no output."
        return output
    except subprocess.TimeoutExpired:
        logger.error(f"Command '{command}' timed out.")
        return "Command timed out after 15 seconds."
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed: {e.stderr}")
        return f"Command failed with error: {e.stderr.strip()}"
    except Exception as e:
        logger.error(f"Unexpected error executing command: {e}")
        return f"An unexpected error occurred: {str(e)}"
