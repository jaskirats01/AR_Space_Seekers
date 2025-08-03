"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, ImageIcon, Zap } from "lucide-react"
import { processImageWithPyTorch } from "@/lib/pytorch-processor"
import type { DetectionResult } from "@/types/detection"
import LoadingSpinner from "./loading-spinner"

interface ImageUploadProps {
  onDetectionComplete: (results: DetectionResult[], processedImage?: string) => void
  onProcessingStart: () => void
  isProcessing: boolean
}

export default function ImageUpload({ onDetectionComplete, onProcessingStart, isProcessing }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      onProcessingStart()

      try {
        const results = await processImageWithPyTorch(file)
        onDetectionComplete(results.detections, results.processedImage)
      } catch (error) {
        console.error("Error processing image:", error)
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
    <div id="upload-section" className="max-w-2xl mx-auto">
      <motion.div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? "border-cyan-400 bg-cyan-400/10"
            : "border-purple-400/50 hover:border-purple-400 hover:bg-purple-400/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <LoadingSpinner />
              <p className="text-lg text-cyan-400 mt-4">Processing image with AI...</p>
            </motion.div>
          ) : uploadedImage ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <img
                src={uploadedImage || "/placeholder.svg"}
                alt="Uploaded"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Upload Another Image
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Upload className="w-12 h-12 text-white" />
              </motion.div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Upload Your Image</h3>
                <p className="text-gray-300 mb-6">Drag and drop an image here, or click to select</p>
              </div>

              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full font-semibold text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                <ImageIcon className="w-5 h-5" />
                Choose Image
              </motion.button>

              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  AI Powered
                </span>
                <span>•</span>
                <span>Supports JPG, PNG, WebP</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
