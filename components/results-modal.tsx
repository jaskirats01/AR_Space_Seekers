"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, Target } from "lucide-react"
import type { DetectionResult } from "@/types/detection"

interface ResultsModalProps {
  isOpen: boolean
  onClose: () => void
  results: DetectionResult[]
}

export default function ResultsModal({ isOpen, onClose, results }: ResultsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-purple-400/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-cyan-400" />
                Detection Results
              </h2>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-gray-400" />
              </motion.button>
            </div>

            <div className="space-y-4">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-4 border border-purple-400/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white capitalize">{result.label}</h3>
                      <div className="flex items-center gap-1 text-cyan-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-mono text-sm">{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                      <motion.div
                        className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>

                    {result.bbox && (
                      <p className="text-sm text-gray-400">
                        Position: ({result.bbox.x.toFixed(0)}, {result.bbox.y.toFixed(0)}) Size:{" "}
                        {result.bbox.width.toFixed(0)}×{result.bbox.height.toFixed(0)}
                      </p>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-400">No objects detected in this image.</p>
                </motion.div>
              )}
            </div>

            <motion.button
              onClick={onClose}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close Results
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
