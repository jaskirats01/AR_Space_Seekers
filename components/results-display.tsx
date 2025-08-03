"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Target, Zap, CheckCircle, Flame, Wrench, Droplets } from "lucide-react"
import type { DetectionResult } from "@/types/detection"

interface ResultsDisplayProps {
  results: DetectionResult[]
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate each result card
      gsap.fromTo(
        ".result-card",
        {
          opacity: 0,
          x: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
      )

      // Animate progress bars
      gsap.fromTo(
        ".progress-bar",
        { width: "0%" },
        {
          width: (i, target) => target.dataset.width,
          duration: 1,
          delay: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        },
      )

      // Glowing effect for high confidence results
      results.forEach((result, index) => {
        if (result.confidence > 0.8) {
          gsap.to(`.result-card-${index}`, {
            boxShadow: "0 0 20px #00ff00",
            duration: 2,
            ease: "power2.inOut",
            yoyo: true,
            repeat: -1,
          })
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [results])

  const getComponentIcon = (label: string) => {
    if (label.includes("fire extinguisher")) return <Flame className="w-5 h-5 text-red-400" />
    if (label.includes("toolbox")) return <Wrench className="w-5 h-5 text-orange-400" />
    if (label.includes("oxygen tank")) return <Droplets className="w-5 h-5 text-blue-400" />
    return <Target className="w-5 h-5 text-cyan-400" />
  }

  const getComponentColor = (label: string) => {
    if (label.includes("fire extinguisher")) return "border-red-400/50"
    if (label.includes("toolbox")) return "border-orange-400/50"
    if (label.includes("oxygen tank")) return "border-blue-400/50"
    return "border-purple-400/50"
  }

  const getProgressColor = (label: string, confidence: number) => {
    if (label.includes("fire extinguisher")) return "bg-gradient-to-r from-red-400 to-red-600"
    if (label.includes("toolbox")) return "bg-gradient-to-r from-orange-400 to-orange-600"
    if (label.includes("oxygen tank")) return "bg-gradient-to-r from-blue-400 to-blue-600"
    if (confidence > 0.8) return "bg-gradient-to-r from-green-400 to-green-600"
    if (confidence > 0.6) return "bg-gradient-to-r from-cyan-400 to-cyan-600"
    return "bg-gradient-to-r from-purple-400 to-purple-600"
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white font-orbitron mb-2">DETECTION RESULTS</h3>
        <p className="text-gray-300 font-rajdhani">AI Analysis Complete</p>
      </div>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`result-card result-card-${index} bg-gray-900/70 border rounded-lg p-6 backdrop-blur-sm transition-all duration-300 ${getComponentColor(result.label)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      result.confidence > 0.8
                        ? "bg-green-400"
                        : result.confidence > 0.6
                          ? "bg-cyan-400"
                          : "bg-purple-400"
                    }`}
                  ></div>
                  <div className="flex items-center gap-2">
                    {getComponentIcon(result.label)}
                    <h4 className="text-xl font-semibold text-white font-orbitron capitalize">
                      {result.label.replace("class_", "").replace(/_/g, " ")}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.confidence > 0.8 && <CheckCircle className="w-5 h-5 text-green-400" />}
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-lg font-bold text-white">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2 font-rajdhani">
                  <span>CONFIDENCE LEVEL</span>
                  <span>{result.confidence > 0.8 ? "HIGH" : result.confidence > 0.6 ? "MEDIUM" : "LOW"}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`progress-bar h-full rounded-full transition-all duration-1000 ${getProgressColor(result.label, result.confidence)}`}
                    data-width={`${result.confidence * 100}%`}
                  ></div>
                </div>
              </div>

              {result.bbox && (
                <div className="grid grid-cols-2 gap-4 text-sm font-rajdhani">
                  <div>
                    <span className="text-gray-400">POSITION:</span>
                    <span className="text-white ml-2">
                      ({result.bbox.x.toFixed(0)}, {result.bbox.y.toFixed(0)})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">SIZE:</span>
                    <span className="text-white ml-2">
                      {result.bbox.width.toFixed(0)}×{result.bbox.height.toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 font-rajdhani text-lg">No objects detected in this image</p>
        </div>
      )}
    </div>
  )
}
