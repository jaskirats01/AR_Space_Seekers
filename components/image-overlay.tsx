"use client"

import { useRef, useEffect } from "react"
import type { DetectionResult } from "@/types/detection"

interface ImageOverlayProps {
  imageSrc: string
  detections: DetectionResult[]
}

export default function ImageOverlay({ imageSrc, detections }: ImageOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageSrc) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw the image
      ctx.drawImage(img, 0, 0)

      // Draw detection boxes
      detections.forEach((detection, index) => {
        if (!detection.bbox) return

        const { x, y, width, height } = detection.bbox
        const confidence = detection.confidence
        const label = detection.label

        // Choose color based on component type
        let color = "#ff0000" // red for unknown
        let borderWidth = 3
        
        if (label.includes("fire extinguisher")) {
          color = "#ff4444" // red for fire extinguisher
          borderWidth = 4
        } else if (label.includes("toolbox")) {
          color = "#ffaa00" // orange for toolbox
          borderWidth = 4
        } else if (label.includes("oxygen tank")) {
          color = "#00aaff" // blue for oxygen tank
          borderWidth = 4
        } else if (confidence > 0.8) {
          color = "#00ff00" // green for high confidence
        } else if (confidence > 0.6) {
          color = "#ffff00" // yellow for medium confidence
        }

        // Draw bounding box with thicker lines for important components
        ctx.strokeStyle = color
        ctx.lineWidth = borderWidth
        ctx.strokeRect(x, y, width, height)

        // Add a subtle glow effect
        ctx.shadowColor = color
        ctx.shadowBlur = 10
        ctx.strokeRect(x, y, width, height)
        ctx.shadowBlur = 0

        // Draw label background
        const displayLabel = label.replace("class_", "").toUpperCase()
        const labelText = `${displayLabel} (${(confidence * 100).toFixed(1)}%)`
        const textMetrics = ctx.measureText(labelText)
        const textWidth = textMetrics.width
        const textHeight = 20

        // Position label above the box
        const labelX = Math.max(0, x)
        const labelY = Math.max(textHeight + 5, y - 10)

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(labelX, labelY - textHeight - 5, textWidth + 10, textHeight + 5)

        // Draw label text
        ctx.fillStyle = color
        ctx.font = "bold 14px Arial"
        ctx.fillText(labelText, labelX + 5, labelY - 5)

        // Add a small indicator dot
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x + width/2, y + height/2, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    img.src = imageSrc
  }, [imageSrc, detections])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg border border-purple-400/30"
      />
      {detections.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-cyan-400 font-semibold">
            Found {detections.length} object{detections.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            {detections.some(d => d.label.includes("fire extinguisher")) && (
              <span className="text-red-400">🔴 Fire Extinguisher</span>
            )}
            {detections.some(d => d.label.includes("toolbox")) && (
              <span className="text-orange-400">🟠 Toolbox</span>
            )}
            {detections.some(d => d.label.includes("oxygen tank")) && (
              <span className="text-blue-400">🔵 Oxygen Tank</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 