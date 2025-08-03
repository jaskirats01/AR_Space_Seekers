"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Video, Wifi, AlertTriangle, Settings } from "lucide-react"

export default function RealTimeSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoBoxRef = useRef<HTMLDivElement>(null)
  const scanLineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Flickering border animation
      gsap.to(videoBoxRef.current, {
        boxShadow: "0 0 30px #00ffff, inset 0 0 30px #00ffff",
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      })

      // Scan line animation
      gsap.to(scanLineRef.current, {
        y: 300,
        duration: 3,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      })

      // Status indicators blinking
      gsap.to(".status-indicator", {
        opacity: 0.3,
        duration: 1,
        ease: "power2.inOut",
        stagger: 0.2,
        yoyo: true,
        repeat: -1,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="scroll-animate py-20 px-4 relative">
      <div ref={containerRef} className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 font-orbitron bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            REAL-TIME DETECTION
          </h2>
          <p className="text-xl text-gray-300 font-rajdhani max-w-3xl mx-auto">
            Live spacecraft monitoring and component analysis system
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div
              ref={videoBoxRef}
              className="relative bg-gray-900 rounded-2xl p-8 border-2 border-cyan-400/50 overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              {/* Scan line */}
              <div
                ref={scanLineRef}
                className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 z-10"
                style={{ top: "0px" }}
              ></div>

              {/* Video placeholder */}
              <div className="absolute inset-4 bg-black rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                  <h3 className="text-2xl font-bold text-white font-orbitron mb-2">COMING SOON</h3>
                  <p className="text-gray-400 font-rajdhani">Real-Time AI Detection</p>
                  <div className="mt-4 px-4 py-2 bg-cyan-400/20 rounded-full border border-cyan-400/50">
                    <span className="text-cyan-400 font-rajdhani text-sm">SYSTEM IN DEVELOPMENT</span>
                  </div>
                </div>
              </div>

              {/* Corner overlays */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400"></div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <div className="bg-gray-900/70 border border-purple-400/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white font-orbitron mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                SYSTEM STATUS
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-rajdhani">AI Model</span>
                  <div className="flex items-center gap-2">
                    <div className="status-indicator w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm font-rajdhani">LOADED</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-rajdhani">Camera Feed</span>
                  <div className="flex items-center gap-2">
                    <div className="status-indicator w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 text-sm font-rajdhani">PENDING</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-rajdhani">Processing</span>
                  <div className="flex items-center gap-2">
                    <div className="status-indicator w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-cyan-400 text-sm font-rajdhani">READY</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/70 border border-purple-400/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white font-orbitron mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-green-400" />
                CONNECTION
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300 font-rajdhani">Latency</span>
                  <span className="text-green-400 font-rajdhani">12ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 font-rajdhani">FPS</span>
                  <span className="text-green-400 font-rajdhani">30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 font-rajdhani">Quality</span>
                  <span className="text-green-400 font-rajdhani">1080p</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/70 border border-orange-400/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white font-orbitron mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                ALERTS
              </h3>

              <div className="text-center py-4">
                <p className="text-gray-400 font-rajdhani">No active alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
