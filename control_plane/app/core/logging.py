import logging
import json
import re
from datetime import datetime
from typing import Any, Dict
from logging import LogRecord

# PII Patterns to scrub from logs
PII_PATTERNS = {
    "email": r"[\w\.-]+@[\w\.-]+\.\w+",
    "api_key": r"(?:api_key|secret|token)[:=]\s*([a-zA-Z0-9_\-]{16,})",
    "credit_card": r"\b(?:\d[ -]*?){13,16}\b",
}

class PIIFilter(logging.Filter):
    """
    Filter that scrubs PII from log messages before they are emitted.
    """
    def filter(self, record: LogRecord) -> bool:
        msg = str(record.msg)
        for label, pattern in PII_PATTERNS.items():
            msg = re.sub(pattern, f"<{label.upper()}>", msg)
        record.msg = msg
        return True

class JSONFormatter(logging.Formatter):
    """
    Custom formatter to output logs in JSON format for structured logging.
    """
    def format(self, record: LogRecord) -> str:
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "funcName": record.funcName,
            "lineno": record.lineno,
        }
        
        # Add extra context if provided
        if hasattr(record, "extra_info"):
            log_record["extra"] = record.extra_info
            
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_record)

def setup_logging():
    """
    Configures the application logging to use structured JSON output and PII filtering.
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Clear existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
        
    handler = logging.StreamHandler()
    handler.addFilter(PIIFilter())
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    
    logging.info("Structured logging initialized with PII scrubbing.")
