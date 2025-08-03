#!/usr/bin/env python3
"""
Test script to demonstrate image output format with bounding boxes
"""

import requests
import base64
import json
from PIL import Image, ImageDraw, ImageFont
import os

def create_test_image():
    """Create a test image"""
    # Create a 800x600 test image
    img = Image.new('RGB', (800, 600), color='darkblue')
    draw = ImageDraw.Draw(img)
    
    # Draw some shapes to simulate spacecraft components
    # Fire extinguisher (red rectangle)
    draw.rectangle([50, 100, 200, 300], fill='red', outline='white', width=2)
    
    # Toolbox (green rectangle)
    draw.rectangle([400, 150, 600, 250], fill='green', outline='white', width=2)
    
    # Oxygen tank (blue circle)
    draw.ellipse([300, 400, 450, 550], fill='blue', outline='white', width=2)
    
    # Add some text
    draw.text((50, 50), "Spacecraft Test Image", fill='white')
    
    return img

def test_api():
    """Test the API with image output"""
    print("🧪 Testing Spacecraft Detection API with Image Output")
    print("=" * 60)
    
    # Create test image
    test_image = create_test_image()
    
    # Save test image
    test_image.save("test_input.jpg")
    print("📸 Created test image: test_input.jpg")
    
    # Convert to base64
    buffer = io.BytesIO()
    test_image.save(buffer, format='JPEG')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    # Prepare request
    payload = {
        "image": image_base64,
        "filename": "test_input.jpg",
        "file_size": len(image_base64)
    }
    
    try:
        print("📤 Sending request to API...")
        response = requests.post("http://localhost:8000/detect", json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ API response received!")
            print(f"📊 Found {len(data['detections'])} detections")
            
            # Save the processed image
            if data.get('processed_image'):
                processed_image_data = base64.b64decode(data['processed_image'])
                with open("test_output.jpg", "wb") as f:
                    f.write(processed_image_data)
                print("🖼️ Saved processed image: test_output.jpg")
                
                # Show detection details
                for i, detection in enumerate(data['detections']):
                    print(f"🔹 Detection {i+1}:")
                    print(f"   Class: {detection['class_id']}")
                    print(f"   Confidence: {detection['confidence']:.3f}")
                    print(f"   Bounding Box: x={detection['bbox']['x']:.1f}, y={detection['bbox']['y']:.1f}, w={detection['bbox']['width']:.1f}, h={detection['bbox']['height']:.1f}")
                    print()
                
                print("🎉 Test completed successfully!")
                print("📁 Check the following files:")
                print("   - test_input.jpg (original image)")
                print("   - test_output.jpg (processed image with bounding boxes)")
                print("   - output_results/ (additional processed images)")
                
            else:
                print("⚠️ No processed image in response")
                
        else:
            print(f"❌ API request failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server")
        print("   Make sure the backend is running: python api/simple-detect.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    import io
    test_api() 