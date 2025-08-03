"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating animation for the hero container
      gsap.to(heroRef.current, {
        y: -20,
        duration: 4,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      })

      // Glowing text animation
      gsap.to(titleRef.current, {
        textShadow: "0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff",
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      })

      // Button hover animations
      const button = buttonRef.current
      if (button) {
        button.addEventListener("mouseenter", () => {
          gsap.to(button, {
            scale: 1.05,
            boxShadow: "0 0 30px #8b5cf6",
            duration: 0.3,
            ease: "power2.out",
          })
        })

        button.addEventListener("mouseleave", () => {
          gsap.to(button, {
            scale: 1,
            boxShadow: "0 0 15px #8b5cf6",
            duration: 0.3,
            ease: "power2.out",
          })
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const scrollToUpload = () => {
    const uploadSection = document.getElementById("upload-section")
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 animate-pulse"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 animate-pulse delay-2000"></div>
      </div>

      <div ref={heroRef} className="text-center z-10 px-4 max-w-6xl mx-auto">
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 font-orbitron bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent"
          style={{ textShadow: "0 0 10px #00ffff" }}
        >
          SPACECRAFT
        </h1>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 font-orbitron text-white">
          AI DETECTION SYSTEM
        </h2>

        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-rajdhani leading-relaxed"
        >
          Advanced neural network technology for real-time spacecraft component identification and analysis
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            ref={buttonRef}
            onClick={scrollToUpload}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold text-white text-lg font-rajdhani tracking-wider border border-purple-400/50 transition-all duration-300"
            style={{ boxShadow: "0 0 15px #8b5cf6" }}
          >
            START DETECTION
          </button>

          <button className="px-8 py-4 border-2 border-cyan-400 rounded-lg font-semibold text-cyan-400 text-lg font-rajdhani tracking-wider hover:bg-cyan-400/10 transition-all duration-300">
            VIEW DOCUMENTATION
          </button>
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="scan-line"></div>
        </div>
      </div>
    </section>
  )
}
