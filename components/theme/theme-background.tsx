"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface ThemeBackgroundProps {
  color: "pomodoro" | "cronometro"
}

export function ThemeBackground({ color }: ThemeBackgroundProps) {
  const [mounted, setMounted] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
    setPortalTarget(document.getElementById("dashboard-background-portal"))
    
    // Theme color metadata for mobile browsers
    const colorHex = color === "pomodoro" ? "#8B4444" : "#526D96"
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colorHex)
    } else {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      metaThemeColor.setAttribute('content', colorHex)
      document.head.appendChild(metaThemeColor)
    }

    return () => {
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) {
        meta.setAttribute('content', '#0a0a0a')
      }
    }
  }, [color])

  if (!mounted || !portalTarget) return null

  const bgContent = color === "pomodoro" ? (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B4444]/90 via-[#8B4444]/85 to-black/95 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-400/10 blur-[150px] rounded-full pointer-events-none" />
    </>
  ) : (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#526D96]/90 via-[#526D96]/85 to-black/95 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#526D96]/30 blur-[150px] rounded-full pointer-events-none" />
    </>
  )

  // Portal to the layout's dedicated background container
  return createPortal(bgContent, portalTarget)
}
