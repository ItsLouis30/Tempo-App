"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Theme, themes, defaultTheme } from "@/lib/themes"

type ThemeContextType = {
  theme: Theme
  setTheme: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Cargar de local storage al montar
  useEffect(() => {
    setMounted(true)
    const savedThemeId = localStorage.getItem("tempo-theme")
    if (savedThemeId) {
      const foundTheme = themes.find(t => t.id === savedThemeId)
      if (foundTheme) {
        setThemeState(foundTheme)
      }
    }
  }, [])

  // Aplicar variables CSS dinámicamente cuando el tema cambia
  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    root.style.setProperty('--theme-gradient-start', theme.colors.gradientStart)
    root.style.setProperty('--theme-gradient-end', theme.colors.gradientEnd)
    root.style.setProperty('--theme-glass-tint', theme.colors.glassTint)
    root.style.setProperty('--theme-overlay-opacity', theme.colors.overlayOpacity)
    
  }, [theme, mounted])

  const setTheme = (themeId: string) => {
    const foundTheme = themes.find(t => t.id === themeId)
    if (foundTheme) {
      setThemeState(foundTheme)
      localStorage.setItem("tempo-theme", themeId)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
