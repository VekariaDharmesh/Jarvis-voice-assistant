import webbrowser
import urllib.parse
from backend.security.logger import logger

def open_url(url: str) -> str:
    """
    Opens a specific URL in the default web browser.
    """
    logger.info(f"Tool Execution: Opening URL '{url}'")
    try:
        if not url.startswith('http'):
            url = 'https://' + url
        webbrowser.open(url)
        return f"Successfully opened {url} in the browser."
    except Exception as e:
        logger.error(f"Error opening URL: {e}")
        return f"Failed to open URL {url}."

def search_web(query: str) -> str:
    """
    Searches the web using Google in the default browser.
    """
    logger.info(f"Tool Execution: Searching web for '{query}'")
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://www.google.com/search?q={encoded_query}"
        webbrowser.open(url)
        return f"Successfully searched the web for '{query}'."
    except Exception as e:
        logger.error(f"Error searching web: {e}")
        return f"Failed to search for '{query}'."
