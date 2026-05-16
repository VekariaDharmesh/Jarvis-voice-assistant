import logging
import os
from datetime import datetime

class JarvisLogger:
    def __init__(self, name="JARVIS", log_dir="logs"):
        self.log_dir = log_dir
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)
        
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)
        
        # Create handlers
        c_handler = logging.StreamHandler()
        f_handler = logging.FileHandler(os.path.join(self.log_dir, f'jarvis_{datetime.now().strftime("%Y%m%d")}.log'))
        c_handler.setLevel(logging.INFO)
        f_handler.setLevel(logging.DEBUG)
        
        # Create formatters and add it to handlers
        c_format = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
        f_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        c_handler.setFormatter(c_format)
        f_handler.setFormatter(f_format)
        
        # Add handlers to the logger
        if not self.logger.handlers:
            self.logger.addHandler(c_handler)
            self.logger.addHandler(f_handler)

    def get_logger(self):
        return self.logger

# Global instance
logger = JarvisLogger().get_logger()
