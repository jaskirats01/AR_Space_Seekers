"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Github, Twitter, Linkedin, Mail, Rocket } from "lucide-react"

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate social icons
      gsap.utils.toArray(".social-icon").forEach((icon: any) => {
        icon.addEventListener("mouseenter", () => {
          gsap.to(icon, {
            scale: 1.2,
            rotation: 360,
            duration: 0.3,
            ease: "power2.out",
          })
        })

        icon.addEventListener("mouseleave", () => {
          gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
          })
        })
      })

      // Floating animation for rocket icon
      gsap.to(".rocket-icon", {
        y: -10,
        duration: 2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      })
    }, footerRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer ref={footerRef} className="scroll-animate py-16 px-4 border-t border-purple-400/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Rocket className="rocket-icon w-8 h-8 text-cyan-400" />
              <h3 className="text-2xl font-bold font-orbitron text-white">SPACECRAFT AI</h3>
            </div>
            <p className="text-gray-400 font-rajdhani">
              Advanced AI-powered spacecraft detection and analysis system for the future of space exploration.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white font-orbitron">NAVIGATION</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors font-rajdhani">
                Detection System
              </a>
              <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors font-rajdhani">
                Real-Time Analysis
              </a>
              <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors font-rajdhani">
                Documentation
              </a>
              <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors font-rajdhani">
                API Access
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white font-orbitron">CONNECT</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="social-icon w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-purple-400/30 hover:border-cyan-400 transition-colors"
              >
                <Github className="w-5 h-5 text-gray-400 hover:text-cyan-400" />
              </a>
              <a
                href="#"
                className="social-icon w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-purple-400/30 hover:border-cyan-400 transition-colors"
              >
                <Twitter className="w-5 h-5 text-gray-400 hover:text-cyan-400" />
              </a>
              <a
                href="#"
                className="social-icon w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-purple-400/30 hover:border-cyan-400 transition-colors"
              >
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-cyan-400" />
              </a>
              <a
                href="#"
                className="social-icon w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-purple-400/30 hover:border-cyan-400 transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-400 hover:text-cyan-400" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-purple-400/20 pt-8 text-center">
          <p className="text-gray-400 font-rajdhani">© 2024 Spacecraft AI Detection System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
