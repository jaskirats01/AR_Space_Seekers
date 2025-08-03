from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import io
import json
from PIL import Image, ImageDraw, ImageFont
import os
import uuid
from typing import List, Dict, Any

# Try to import ultralytics
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    print("⚠️ Ultralytics not available, using mock mode")
    YOLO_AVAILABLE = False

app = FastAPI(title="Spacecraft Detection API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    processed_image: str  # base64 encoded processed image

# Global model variable
model = None
model_info = None

def load_model():
    """Load the PyTorch YOLO model"""
    global model, model_info
    
    try:
        # Check if model file exists
        model_path = "public/models/best.pt"
        if not os.path.exists(model_path):
            print(f"❌ Model file not found at {model_path}")
            return None
        
        print(f"✅ Model file found: {model_path}")
        print(f"📏 Model size: {os.path.getsize(model_path) / (1024*1024):.1f} MB")
        
        if YOLO_AVAILABLE:
            print("🚀 Loading YOLO model...")
            model = YOLO(model_path)
            
            # Get model information
            model_info = {
                "model_name": "YOLOv8 Spacecraft Detector",
                "model_path": model_path,
                "input_shape": [1, 3, 640, 640],
                "num_classes": len(model.names),
                "labels": list(model.names.values())
            }
            
            print("✅ Model loaded successfully")
            print(f"📋 Model info: {model_info}")
            return model_info
        else:
            # Mock model info
            model_info = {
                "model_name": "YOLOv8 Spacecraft Detector (Mock)",
                "model_path": model_path,
                "input_shape": [1, 3, 640, 640],
                "num_classes": 3,
                "labels": ["fire extinguisher", "toolbox", "oxygen tank"]
            }
            print("⚠️ Using mock model (ultralytics not available)")
            return model_info
            
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

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
        (255, 0, 0),    # Red - fire extinguisher
        (0, 255, 0),    # Green - toolbox
        (0, 0, 255),    # Blue - oxygen tank
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
        if model_info and detection.class_id < len(model_info["labels"]):
            label = model_info["labels"][detection.class_id]
        else:
            label = f"Class {detection.class_id}"
        
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

# Load model on startup
model_info = load_model()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model_info is not None}

@app.get("/info")
async def get_model_info():
    """Get model information"""
    if model_info is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    return model_info

@app.post("/detect")
async def detect_objects(request: DetectionRequest):
    """Detect spacecraft components in the image"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(image_data))
        
        print(f"📸 Processing image: {request.filename} ({request.file_size} bytes)")
        print(f"📐 Image size: {image.size}")
        
        detections = []
        
        if model and YOLO_AVAILABLE:
            # Use real YOLO model
            print("🧠 Running YOLO inference...")
            results = model(image)
            
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
        else:
            # Use mock detections
            print("⚠️ Using mock detections (model not available)")
            img_width, img_height = image.size
            
            # Mock detection 1 (fire extinguisher)
            detections.append(Detection(
                class_id=0,
                confidence=0.85,
                bbox=BoundingBox(
                    x=img_width * 0.1,
                    y=img_height * 0.2,
                    width=img_width * 0.15,
                    height=img_height * 0.2
                )
            ))
            
            # Mock detection 2 (toolbox)
            detections.append(Detection(
                class_id=1,
                confidence=0.92,
                bbox=BoundingBox(
                    x=img_width * 0.6,
                    y=img_height * 0.3,
                    width=img_width * 0.2,
                    height=img_height * 0.15
                )
            ))
            
            # Mock detection 3 (oxygen tank)
            detections.append(Detection(
                class_id=2,
                confidence=0.78,
                bbox=BoundingBox(
                    x=img_width * 0.3,
                    y=img_height * 0.6,
                    width=img_width * 0.12,
                    height=img_height * 0.25
                )
            ))
        
        print(f"✅ Found {len(detections)} detections")
        
        # Draw detections on the image
        processed_image = draw_detections_on_image(image, detections)
        
        # Convert processed image to base64
        processed_image_base64 = image_to_base64(processed_image)
        
        # Save the processed image to output directory
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
            processed_image=processed_image_base64
        )
        
        return response
        
    except Exception as e:
        print(f"❌ Error during detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Spacecraft Detection API...")
    print(f"📋 Model info: {model_info}")
    uvicorn.run(app, host="0.0.0.0", port=8000) 