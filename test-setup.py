#!/usr/bin/env python3
"""
Test script to verify PyTorch backend setup
"""

import os
import sys
import requests
import json
from pathlib import Path

def test_model_file():
    """Test if the model file exists"""
    model_path = Path("public/models/best.pt")
    if model_path.exists():
        print(f"✅ Model file found: {model_path}")
        print(f"   Size: {model_path.stat().st_size / (1024*1024):.1f} MB")
        return True
    else:
        print(f"❌ Model file not found: {model_path}")
        print("   Please place your 'best.pt' file in public/models/")
        return False

def test_output_directory():
    """Test if output directory can be created"""
    output_dir = Path("output_results")
    try:
        output_dir.mkdir(exist_ok=True)
        print(f"✅ Output directory ready: {output_dir}")
        return True
    except Exception as e:
        print(f"❌ Cannot create output directory: {e}")
        return False

def test_python_dependencies():
    """Test if Python dependencies are installed"""
    try:
        import torch
        print(f"✅ PyTorch installed: {torch.__version__}")
    except ImportError:
        print("❌ PyTorch not installed")
        return False
    
    try:
        import ultralytics
        print(f"✅ Ultralytics installed: {ultralytics.__version__}")
    except ImportError:
        print("❌ Ultralytics not installed")
        return False
    
    try:
        import fastapi
        print(f"✅ FastAPI installed: {fastapi.__version__}")
    except ImportError:
        print("❌ FastAPI not installed")
        return False
    
    try:
        from PIL import Image, ImageDraw, ImageFont
        print("✅ PIL/Pillow installed")
    except ImportError:
        print("❌ PIL/Pillow not installed")
        return False
    
    return True

def test_backend_server():
    """Test if the backend server is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend server is running")
            print(f"   Status: {data.get('status', 'unknown')}")
            print(f"   Model loaded: {data.get('model_loaded', False)}")
            return True
        else:
            print(f"❌ Backend server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend server not running")
        print("   Start it with: python api/detect.py")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def test_frontend_server():
    """Test if the frontend server is running"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend server is running")
            return True
        else:
            print(f"❌ Frontend server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Frontend server not running")
        print("   Start it with: npm run dev")
        return False
    except Exception as e:
        print(f"❌ Error testing frontend: {e}")
        return False

def test_image_processing():
    """Test if image processing works"""
    try:
        # Create a simple test image
        from PIL import Image, ImageDraw
        
        # Create a 100x100 test image
        test_image = Image.new('RGB', (100, 100), color='blue')
        draw = ImageDraw.Draw(test_image)
        draw.rectangle([20, 20, 80, 80], fill='red')
        
        # Save test image
        test_image_path = "test_image.jpg"
        test_image.save(test_image_path)
        
        # Convert to base64
        import base64
        with open(test_image_path, "rb") as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
        
        # Test API call
        payload = {
            "image": img_data,
            "filename": "test_image.jpg",
            "file_size": len(img_data)
        }
        
        response = requests.post("http://localhost:8000/detect", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Image processing test successful")
            print(f"   Detections: {len(data.get('detections', []))}")
            print(f"   Processed image: {'Yes' if data.get('processed_image') else 'No'}")
            
            # Clean up test file
            if os.path.exists(test_image_path):
                os.remove(test_image_path)
            
            return True
        else:
            print(f"❌ Image processing test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing image processing: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Spacecraft AI Detector Setup")
    print("=" * 50)
    
    tests = [
        ("Model File", test_model_file),
        ("Output Directory", test_output_directory),
        ("Python Dependencies", test_python_dependencies),
        ("Backend Server", test_backend_server),
        ("Frontend Server", test_frontend_server),
        ("Image Processing", test_image_processing),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        if test_func():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your setup is ready.")
        print("\n🚀 Next steps:")
        print("   1. Upload an image at http://localhost:3000")
        print("   2. Test the AI detection")
        print("   3. Check output_results/ for processed images")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        print("\n📖 See README.md for setup instructions")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 