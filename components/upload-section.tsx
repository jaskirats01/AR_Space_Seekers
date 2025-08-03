"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { gsap } from "gsap"
import { Upload, Zap, Target, AlertCircle } from "lucide-react"
import { processImageWithPyTorch } from "@/lib/pytorch-processor"
import type { DetectionResult } from "@/types/detection"
import ResultsDisplay from "./results-display"
import ImageOverlay from "./image-overlay"

export default function UploadSection() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<DetectionResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAreaRef = useRef<HTMLDivElement>(null)
  const processingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hover animations for upload area
      const uploadArea = uploadAreaRef.current
      if (uploadArea) {
        uploadArea.addEventListener("mouseenter", () => {
          gsap.to(uploadArea, {
            scale: 1.02,
            boxShadow: "0 0 30px #00ffff",
            duration: 0.3,
            ease: "power2.out",
          })
        })

        uploadArea.addEventListener("mouseleave", () => {
          gsap.to(uploadArea, {
            scale: 1,
            boxShadow: "0 0 15px #8b5cf6",
            duration: 0.3,
            ease: "power2.out",
          })
        })
      }
    }, uploadAreaRef)

    return () => ctx.revert()
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string
      setUploadedImage(imageUrl)
      setIsProcessing(true)
      setShowResults(false)

      // Animate processing state
      if (processingRef.current) {
        gsap.fromTo(
          processingRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
        )
      }

      try {
        const detectionResults = await processImageWithPyTorch(file)
        setResults(detectionResults.detections)
        if (detectionResults.processedImage) {
          setProcessedImage(`data:image/jpeg;base64,${detectionResults.processedImage}`)
        }
        setShowResults(true)
        setIsProcessing(false)

        // Animate results display
        gsap.fromTo(
          ".results-container",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        )
      } catch (error) {
        console.error("Error processing image:", error)
        setIsProcessing(false)
        alert("Error processing image. Please try again.")
      }
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <section id="upload-section" className="scroll-animate py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 font-orbitron bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            AI DETECTION
          </h2>
          <p className="text-xl text-gray-300 font-rajdhani max-w-3xl mx-auto">
            Upload spacecraft images for advanced AI-powered component detection and analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Upload Area */}
          <div className="space-y-8">
            <div
              ref={uploadAreaRef}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-purple-400/50 hover:border-purple-400 bg-gray-900/50"
              }`}
              style={{ boxShadow: "0 0 15px #8b5cf6" }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />

              {isProcessing ? (
                <div ref={processingRef} className="space-y-6">
                  <div className="w-20 h-20 mx-auto relative">
                    <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-purple-400/30 rounded-full animate-spin animate-reverse"></div>
                    <div className="absolute inset-4 border-4 border-green-400/30 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-xl text-cyan-400 font-rajdhani">PROCESSING IMAGE...</p>
                  <div className="scan-line-small"></div>
                </div>
              ) : uploadedImage ? (
                <div className="space-y-6">
                  {showResults && processedImage ? (
                    <div className="space-y-4">
                      <img
                        src={processedImage}
                        alt="Processed spacecraft with detections"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border border-green-400/50"
                      />
                      <p className="text-sm text-green-400 font-rajdhani text-center">
                        ✅ AI Processed Image with Detections
                      </p>
                    </div>
                  ) : showResults && results.length > 0 ? (
                    <ImageOverlay imageSrc={uploadedImage} detections={results} />
                  ) : (
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded spacecraft"
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border border-purple-400/30"
                    />
                  )}
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold text-white font-rajdhani tracking-wider">
                    UPLOAD ANOTHER IMAGE
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">UPLOAD SPACECRAFT IMAGE</h3>
                    <p className="text-gray-300 mb-6 font-rajdhani">Drag and drop or click to select</p>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-400 font-rajdhani">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      AI POWERED
                    </span>
                    <span>•</span>
                    <span>JPG, PNG, WebP</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 border border-purple-400/30 rounded-lg p-4 backdrop-blur-sm">
                <Target className="w-8 h-8 text-cyan-400 mb-2" />
                <h4 className="font-semibold text-white font-orbitron mb-1">PRECISION DETECTION</h4>
                <p className="text-sm text-gray-400 font-rajdhani">
                  Advanced neural networks identify components with high accuracy
                </p>
              </div>
              <div className="bg-gray-900/50 border border-purple-400/30 rounded-lg p-4 backdrop-blur-sm">
                <AlertCircle className="w-8 h-8 text-green-400 mb-2" />
                <h4 className="font-semibold text-white font-orbitron mb-1">REAL-TIME ANALYSIS</h4>
                <p className="text-sm text-gray-400 font-rajdhani">Instant processing and detailed confidence scores</p>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="results-container">{showResults && <ResultsDisplay results={results} />}</div>
        </div>
      </div>
    </section>
  )
}
