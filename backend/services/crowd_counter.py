import numpy as np
from PIL import Image
from io import BytesIO
from ultralytics import YOLO

# Load YOLOv8 model (small variant)
model = YOLO('yolov8n.pt')  # You can use 'yolov8s.pt' for a slightly larger model

async def detect_crowd(file):
    image = await file.read()
    img = Image.open(BytesIO(image)).convert("RGB")
    img_np = np.array(img)

    # YOLOv8 expects numpy array in RGB
    results = model(img_np)
    detections = results[0]

    people = [
        box for box, cls in zip(detections.boxes.xyxy.cpu().numpy(), detections.boxes.cls.cpu().numpy())
        if int(cls) == 0  # class 0 is 'person' in COCO
    ]

    bounding_boxes = [
        {"xmin": float(box[0]), "ymin": float(box[1]), "xmax": float(box[2]), "ymax": float(box[3])}
        for box in people
    ]

    return {
        "total_objects": len(detections.boxes),
        "people_detected": len(people),
        "bounding_boxes": bounding_boxes
    } 