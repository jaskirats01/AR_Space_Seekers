import type { DetectionResult } from "@/types/detection"

// Fallback detection for testing purposes
export async function fallbackDetection(file: File): Promise<DetectionResult[]> {
  console.log("🔄 Using fallback detection for testing...")
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Return mock detections for the three specific components
  const mockDetections: DetectionResult[] = [
    {
      label: "fire extinguisher",
      confidence: 0.89,
      bbox: {
        x: 120,
        y: 80,
        width: 60,
        height: 120
      }
    },
    {
      label: "toolbox",
      confidence: 0.76,
      bbox: {
        x: 300,
        y: 150,
        width: 100,
        height: 80
      }
    },
    {
      label: "oxygen tank",
      confidence: 0.82,
      bbox: {
        x: 450,
        y: 100,
        width: 80,
        height: 150
      }
    }
  ]
  
  console.log("✅ Fallback detection complete:", mockDetections)
  return mockDetections
} 