"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Theme, themes, defaultTheme } from "@/lib/themes"

type ThemeContextType = {
  theme: Theme
  setTheme: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

import { createBrowserClient } from "@supabase/ssr"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Cargar de local storage al montar y luego sincronizar con Supabase
  useEffect(() => {
    setMounted(true)
    const savedThemeId = localStorage.getItem("tempo-theme")
    if (savedThemeId) {
      const foundTheme = themes.find(t => t.id === savedThemeId)
      if (foundTheme) {
        setThemeState(foundTheme)
      }
    }

    const syncThemeWithDB = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from("profiles").select("theme").eq("id", user.id).single()
          if (data && data.theme && data.theme !== savedThemeId) {
            const foundTheme = themes.find(t => t.id === data.theme)
            if (foundTheme) {
              setThemeState(foundTheme)
              localStorage.setItem("tempo-theme", data.theme)
            }
          }
        }
      } catch (error) {
        console.error("Error syncing theme from DB:", error)
      }
    }
    
    syncThemeWithDB()
  }, [])

  // Aplicar variables CSS dinámicamente cuando el tema cambia
  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    root.style.setProperty('--theme-bg-start', theme.colors.gradientStart)
    root.style.setProperty('--theme-bg-end', theme.colors.gradientEnd)
    root.style.setProperty('--theme-glass-tint', theme.colors.glassTint)
    root.style.setProperty('--theme-overlay-opacity', theme.colors.overlayOpacity)
    
  }, [theme, mounted])

  const setTheme = async (themeId: string) => {
    const foundTheme = themes.find(t => t.id === themeId)
    if (foundTheme) {
      setThemeState(foundTheme)
      localStorage.setItem("tempo-theme", themeId)

      // Guardar en Supabase
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("profiles").update({ theme: themeId }).eq("id", user.id)
        }
      } catch (error) {
        console.error("Error saving theme to DB:", error)
      }
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
