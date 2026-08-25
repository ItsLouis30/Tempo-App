"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function DynamicBackground() {
  const pathname = usePathname()
  const isPomodoro = pathname?.includes("/pomodoro")
  const isCronometro = pathname?.includes("/cronometro")

  // Update theme-color for mobile browsers seamlessly
  useEffect(() => {
    let colorHex = "#0a0a0a" // Midnight default
    if (isPomodoro) colorHex = "#8B4444"
    if (isCronometro) colorHex = "#526D96"

    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", colorHex)
    } else {
      metaThemeColor = document.createElement("meta")
      metaThemeColor.setAttribute("name", "theme-color")
      metaThemeColor.setAttribute("content", colorHex)
      document.head.appendChild(metaThemeColor)
    }
  }, [isPomodoro, isCronometro])

  return (
    <>
      {/* Pomodoro Background */}
      <div 
        className={`fixed inset-0 z-[-1] pointer-events-none transition-opacity duration-1000 ease-in-out ${isPomodoro ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B4444]/90 via-[#8B4444]/85 to-black/95 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-400/10 blur-[150px] rounded-full pointer-events-none" />
      </div>

      {/* Cronometro Background */}
      <div 
        className={`fixed inset-0 z-[-1] pointer-events-none transition-opacity duration-1000 ease-in-out ${isCronometro ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#526D96]/90 via-[#526D96]/85 to-black/95 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#526D96]/30 blur-[150px] rounded-full pointer-events-none" />
      </div>
    </>
  )
}
