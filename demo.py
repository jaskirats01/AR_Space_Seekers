#!/usr/bin/env python3
"""
Demo script for Spacecraft AI Detector
Shows how to use the PyTorch backend API
"""

import requests
import base64
import json
from pathlib import Path
import sys

def encode_image(image_path):
    """Convert image to base64"""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

def save_processed_image(base64_image, output_path):
    """Save base64 image to file"""
    image_data = base64.b64decode(base64_image)
    with open(output_path, "wb") as f:
        f.write(image_data)
    print(f"💾 Saved processed image to: {output_path}")

def demo_detection(image_path):
    """Demo the detection API"""
    print(f"🔍 Processing image: {image_path}")
    
    # Check if image exists
    if not Path(image_path).exists():
        print(f"❌ Image not found: {image_path}")
        return
    
    try:
        # Encode image
        image_base64 = encode_image(image_path)
        
        # Prepare request
        payload = {
            "image": image_base64,
            "filename": Path(image_path).name,
            "file_size": len(image_base64)
        }
        
        print("📤 Sending request to API...")
        
        # Make API request
        response = requests.post("http://localhost:8000/detect", json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ Detection successful!")
            print(f"📊 Found {len(data['detections'])} detections")
            
            # Display detections
            for i, detection in enumerate(data['detections']):
                class_id = detection['class_id']
                confidence = detection['confidence']
                bbox = detection['bbox']
                
                print(f"🔹 Detection {i+1}:")
                print(f"   Class ID: {class_id}")
                print(f"   Confidence: {confidence:.3f}")
                print(f"   Bounding Box: x={bbox['x']:.1f}, y={bbox['y']:.1f}, w={bbox['width']:.1f}, h={bbox['height']:.1f}")
                print()
            
            # Save processed image
            if data.get('processed_image'):
                output_path = f"demo_output_{Path(image_path).stem}.jpg"
                save_processed_image(data['processed_image'], output_path)
                print(f"🖼️ Processed image saved as: {output_path}")
            else:
                print("⚠️ No processed image in response")
                
        else:
            print(f"❌ API request failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server")
        print("   Make sure the backend is running: python api/detect.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main demo function"""
    print("🚀 Spacecraft AI Detector Demo")
    print("=" * 40)
    
    # Check if image path provided
    if len(sys.argv) < 2:
        print("Usage: python demo.py <image_path>")
        print("Example: python demo.py test_image.jpg")
        return
    
    image_path = sys.argv[1]
    
    # Check if backend is running
    try:
        health_response = requests.get("http://localhost:8000/health", timeout=5)
        if health_response.status_code != 200:
            print("❌ Backend server is not healthy")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Backend server not running")
        print("   Start it with: python api/detect.py")
        return
    
    print("✅ Backend server is running")
    print()
    
    # Run detection
    demo_detection(image_path)

if __name__ == "__main__":
    main() 