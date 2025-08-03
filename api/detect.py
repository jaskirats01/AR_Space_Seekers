from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import io
import json
from PIL import Image, ImageDraw, ImageFont
import torch
from ultralytics import YOLO
import numpy as np
from typing import List, Dict, Any
import os
import uuid

app = FastAPI(title="Spacecraft Detection API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class DetectionRequest(BaseModel):
    image: str  # base64 encoded image
    filename: str
    file_size: int

# Response models
class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class Detection(BaseModel):
    class_id: int
    confidence: float
    bbox: BoundingBox

class DetectionResponse(BaseModel):
    detections: List[Detection]
    model_info: Dict[str, Any]
    processed_image: str  # base64 encoded processed image

# Global model variable
model = None
model_info = None

def load_model():
    """Load the PyTorch YOLO model"""
    global model, model_info
    
    try:
        # Update this path to your actual model file
        model_path = "public/models/best.pt"
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        print(f"🚀 Loading PyTorch model from {model_path}...")
        model = YOLO(model_path)
        
        # Get model information
        model_info = {
            "model_name": "YOLOv8 Spacecraft Detector",
            "model_path": model_path,
            "input_shape": [1, 3, 640, 640],  # Standard YOLO input
            "num_classes": len(model.names),
            "labels": list(model.names.values())
        }
        
        print("✅ Model loaded successfully")
        print(f"📋 Model info: {model_info}")
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

@app.get("/info")
async def get_model_info():
    """Get model information"""
    if model_info is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    return model_info

def draw_detections_on_image(image: Image.Image, detections: List[Detection]) -> Image.Image:
    """Draw bounding boxes and labels on the image"""
    # Create a copy of the image to draw on
    result_image = image.copy()
    draw = ImageDraw.Draw(result_image)
    
    # Try to load a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    # Colors for different classes
    colors = [
        (255, 0, 0),    # Red
        (0, 255, 0),    # Green
        (0, 0, 255),    # Blue
        (255, 255, 0),  # Yellow
        (255, 0, 255),  # Magenta
        (0, 255, 255),  # Cyan
        (255, 165, 0),  # Orange
        (128, 0, 128),  # Purple
    ]
    
    for i, detection in enumerate(detections):
        # Get bounding box coordinates
        x1 = detection.bbox.x
        y1 = detection.bbox.y
        x2 = x1 + detection.bbox.width
        y2 = y1 + detection.bbox.height
        
        # Choose color based on class
        color = colors[detection.class_id % len(colors)]
        
        # Draw bounding box
        draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
        
        # Prepare label text
        label = model.names[detection.class_id] if detection.class_id in model.names else f"Class {detection.class_id}"
        confidence_text = f"{detection.confidence:.2f}"
        label_text = f"{label} ({confidence_text})"
        
        # Calculate text position
        text_bbox = draw.textbbox((0, 0), label_text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        # Draw background rectangle for text
        text_x = x1
        text_y = y1 - text_height - 5
        if text_y < 0:
            text_y = y1 + 5
        
        draw.rectangle([
            text_x, text_y, 
            text_x + text_width + 10, text_y + text_height + 5
        ], fill=color)
        
        # Draw text
        draw.text((text_x + 5, text_y + 2), label_text, fill=(255, 255, 255), font=font)
    
    return result_image

def image_to_base64(image: Image.Image) -> str:
    """Convert PIL image to base64 string"""
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG', quality=95)
    buffer.seek(0)
    image_bytes = buffer.getvalue()
    return base64.b64encode(image_bytes).decode('utf-8')

@app.post("/detect")
async def detect_objects(request: DetectionRequest):
    """Detect spacecraft components in the image"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(image_data))
        
        print(f"📸 Processing image: {request.filename} ({request.file_size} bytes)")
        print(f"📐 Image size: {image.size}")
        
        # Run inference
        results = model(image)
        
        detections = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get class ID and confidence
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    
                    # Get bounding box coordinates (xyxy format)
                    xyxy = box.xyxy[0].cpu().numpy()
                    x1, y1, x2, y2 = xyxy
                    
                    # Convert to width/height format
                    bbox = BoundingBox(
                        x=float(x1),
                        y=float(y1),
                        width=float(x2 - x1),
                        height=float(y2 - y1)
                    )
                    
                    detection = Detection(
                        class_id=class_id,
                        confidence=confidence,
                        bbox=bbox
                    )
                    
                    detections.append(detection)
        
        print(f"✅ Found {len(detections)} detections")
        
        # Draw detections on the image
        processed_image = draw_detections_on_image(image, detections)
        
        # Convert processed image to base64
        processed_image_base64 = image_to_base64(processed_image)
        
        # Save the processed image to output directory (like in your Python reference)
        output_dir = "output_results"
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())[:8]
        output_filename = f"result_{unique_id}.jpg"
        output_path = os.path.join(output_dir, output_filename)
        
        processed_image.save(output_path)
        print(f"💾 Saved processed image to: {output_path}")
        
        response = DetectionResponse(
            detections=detections,
            model_info=model_info,
            processed_image=processed_image_base64
        )
        
        return response
        
    except Exception as e:
        print(f"❌ Error during detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 