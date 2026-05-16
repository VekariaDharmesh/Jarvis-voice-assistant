import os
import time
import base64
import pyautogui
import cv2
import google.generativeai as genai
from PIL import Image
from backend.core.config import Config
from backend.security.logger import logger

def analyze_visual_content(question: str, source: str = "screen") -> str:
    """
    Captures an image (from the screen or camera) and uses a vision model to answer a question about it.
    
    Args:
        question: The question to ask about the visual content.
        source: Either 'screen' to capture the current screen or 'camera' to capture a photo from the webcam.
    """
    logger.info(f"Tool Execution: Visual Analysis ({source}) - {question}")
    
    if not Config.is_valid_key(Config.GOOGLE_API_KEY):
        return "Error: Google API Key is not set. Vision capabilities require a valid Gemini API key."

    # Create a temporary directory for captures if it doesn't exist
    temp_dir = "temp_captures"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)

    timestamp = int(time.time())
    file_path = os.path.join(temp_dir, f"capture_{timestamp}.png")

    try:
        if source == "screen":
            # Capture Screen
            screenshot = pyautogui.screenshot()
            screenshot.save(file_path)
            logger.info(f"Screen captured to {file_path}")
        elif source == "camera":
            # Capture Camera
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                return "Error: Could not open webcam. Please check if a camera is connected and permissions are granted."
            
            # Give camera a moment to warm up
            time.sleep(1)
            ret, frame = cap.read()
            if not ret:
                cap.release()
                return "Error: Could not read frame from camera."
            
            cv2.imwrite(file_path, frame)
            cap.release()
            logger.info(f"Camera photo captured to {file_path}")
        else:
            return "Error: Invalid source. Choose 'screen' or 'camera'."

        # Initialize Gemini for Vision
        genai.configure(api_key=Config.GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Load image
        img = Image.open(file_path)
        
        # Generate response
        response = model.generate_content([question, img])
        
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)

        return response.text

    except Exception as e:
        logger.error(f"Visual analysis failed: {e}")
        return f"Error during visual analysis: {str(e)}"
