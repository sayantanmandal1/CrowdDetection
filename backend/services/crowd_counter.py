import numpy as np
import cv2
import torch
from PIL import Image
from io import BytesIO

# Load YOLOv8 model (small variant)
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

async def detect_crowd(file):
    image = await file.read()
    img = Image.open(BytesIO(image)).convert("RGB")
    img_np = np.array(img)

    # Convert to BGR for OpenCV compatibility
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    
    results = model(img_bgr)
    detections = results.pandas().xyxy[0]
    people = detections[detections['name'] == 'person']

    return {
        "total_objects": len(detections),
        "people_detected": len(people),
        "bounding_boxes": people[['xmin', 'ymin', 'xmax', 'ymax']].to_dict(orient="records")
    } 