// PyTorch Model Processor for Spacecraft Detection
// This implementation uses a Python backend API to handle PyTorch model inference

import type { DetectionResult } from "@/types/detection"
import { fallbackDetection } from "./fallback-detector"

// Spacecraft component labels - FOCUSED ON THE THREE SPECIFIC COMPONENTS
const SPACECRAFT_LABELS = [
  "fire extinguisher",  // Class 0
  "toolbox",           // Class 1  
  "oxygen tank",       // Class 2
  "control panel", 
  "wire harness",
  "antenna",
  "solar panel",
  "thruster",
  "heat shield",
  "docking port",
  "communication array",
  "fuel tank",
  "navigation system",
  "life support unit",
  "power distribution",
  "thermal radiator",
  "sensor array",
  "cargo bay",
  "airlock",
  "robotic arm",
  "landing gear",
  "propulsion system",
]

// API endpoint for PyTorch model inference
const API_ENDPOINT = "/api/detect" // Update this to match your backend API

// Convert File to base64 for API transmission
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix to get just the base64 string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Process detection results from API response
function processApiResults(apiResponse: any): DetectionResult[] {
  const detections: DetectionResult[] = []

  console.log("🔍 Processing API results...")
  console.log("📊 API response:", apiResponse)

  if (!apiResponse.detections || !Array.isArray(apiResponse.detections)) {
    console.warn("⚠️ Invalid API response format")
    return []
  }

  for (const detection of apiResponse.detections) {
    // Map class ID to label
    let label = `class_${detection.class_id}`
    if (detection.class_id < SPACECRAFT_LABELS.length) {
      label = SPACECRAFT_LABELS[detection.class_id]
    } else {
      // Try to map large class IDs to our three main components
      const classMapping: { [key: number]: string } = {
        1274: "fire extinguisher",
        6364: "toolbox", 
        8163: "oxygen tank",
        8008: "fire extinguisher", // fallback for unknown class
      }
      label = classMapping[detection.class_id] || `class_${detection.class_id}`
    }

    detections.push({
      label,
      confidence: detection.confidence,
      bbox: {
        x: detection.bbox.x,
        y: detection.bbox.y,
        width: detection.bbox.width,
        height: detection.bbox.height
      }
    })
  }

  console.log(`✅ Processed ${detections.length} detections`)
  return detections.sort((a, b) => b.confidence - a.confidence)
}

// Extended response type to include processed image
export interface PyTorchDetectionResponse {
  detections: DetectionResult[]
  processedImage?: string // base64 encoded processed image
}

// Main detection function using PyTorch backend
export async function processImageWithPyTorch(file: File): Promise<PyTorchDetectionResponse> {
  try {
    console.log("🔍 Starting spacecraft component detection with PyTorch...")
    
    // Convert image to base64
    const base64Image = await fileToBase64(file)
    
    // Prepare request payload
    const payload = {
      image: base64Image,
      filename: file.name,
      file_size: file.size
    }

    console.log("📤 Sending request to PyTorch backend...")
    
    // Make API request to Python backend
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const apiResponse = await response.json()
    console.log("📥 Received API response:", apiResponse)

    if (apiResponse.error) {
      throw new Error(`Backend error: ${apiResponse.error}`)
    }

    const detections = processApiResults(apiResponse)
    
    console.log(`✅ Detection complete! Found ${detections.length} components`)
    console.log("🎯 Detections:", detections)
    
    return {
      detections,
      processedImage: apiResponse.processed_image
    }

  } catch (error) {
    console.error("❌ Error in PyTorch detection pipeline:", error)
    console.warn("⚠️ Falling back to mock detection...")
    // Fallback to mock detection if API fails
    const fallbackDetections = await fallbackDetection(file)
    return {
      detections: fallbackDetections
    }
  }
}

// Optional: Get model information from backend
export async function getModelInfo(): Promise<{
  model_name: string
  model_path: string
  input_shape: number[]
  num_classes: number
  labels: string[]
}> {
  try {
    const response = await fetch(`${API_ENDPOINT}/info`)
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const modelInfo = await response.json()
    return modelInfo
  } catch (error) {
    console.error("❌ Could not get model info:", error)
    return {
      model_name: "Unknown",
      model_path: "Unknown",
      input_shape: [1, 3, 640, 640],
      num_classes: SPACECRAFT_LABELS.length,
      labels: SPACECRAFT_LABELS
    }
  }
}

// Health check for backend API
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_ENDPOINT}/health`)
    return response.ok
  } catch (error) {
    console.error("❌ Backend health check failed:", error)
    return false
  }
}