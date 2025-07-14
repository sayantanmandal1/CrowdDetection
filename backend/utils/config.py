import os
from pathlib import Path

# ROOT DIRECTORY
BASE_DIR = Path(__file__).resolve().parent

# MODEL PATHS
YOLO_MODEL_PATH = BASE_DIR / "models/yolov5s.pt"  # Assume downloaded here

# IMAGE UPLOAD PATH
UPLOAD_DIR = BASE_DIR / "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# CROWD THRESHOLDS
CROWD_THRESHOLD_MEDIUM = 500
CROWD_THRESHOLD_HIGH = 1000

# ALERT RULES
ALERT_ACTIONS = {
    "LOW": "Monitor area",
    "MEDIUM": "Divert traffic and notify officials",
    "HIGH": "Evacuate area and deploy emergency response"
}

# UNSAFE NODES FOR ROUTING
UNSAFE_NODES = {"C"} 