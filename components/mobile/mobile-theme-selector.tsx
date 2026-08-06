"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useTheme } from "@/components/theme/theme-provider"
import { themes } from "@/lib/themes"
import { Palette, X, Check } from "lucide-react"

export function MobileThemeSelector() {
  const { theme: currentTheme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-full flex items-center justify-center text-white bg-transparent border-none shadow-none"
      >
        <Palette className="w-6 h-6" />
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="relative w-full max-h-[90vh] overflow-y-auto bg-[#111111]/95 backdrop-blur-xl border-t border-x border-white/10 p-6 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            {/* Mobile handle indicator */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Personalizar Workspace</h2>
                <p className="text-white/50 text-sm mt-1">Elige el ambiente para tu área de trabajo.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {themes.map((t) => {
                const isSelected = currentTheme.id === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`relative flex flex-col items-start p-3 rounded-2xl border transition-all text-left group ${
                      isSelected 
                        ? "border-white/50 bg-white/5 ring-1 ring-white/20" 
                        : "border-white/10 hover:border-white/30 hover:bg-white/5"
                    }`}
                  >
                    {/* Preview circle/card */}
                    <div 
                      className="w-full h-24 rounded-xl mb-3 relative overflow-hidden flex items-end justify-between p-2 shadow-inner"
                      style={{
                        background: `radial-gradient(circle at top left, rgb(${t.colors.gradientStart}) 0%, rgb(${t.colors.gradientEnd}) 100%)`
                      }}
                    >
                      {/* Glass panel simulation inside preview */}
                      <div 
                        className="w-3/4 h-3/4 rounded-lg border backdrop-blur-md"
                        style={{
                          backgroundColor: `rgba(${t.colors.glassTint}, 0.05)`,
                          borderColor: `rgba(${t.colors.glassTint}, 0.1)`
                        }}
                      />
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-1 rounded-full text-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    
                    <span className={`font-medium ${isSelected ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                      {t.name}
                    </span>
                  </button>
                )
              })}
            </div>
            
            <div className="mt-8 text-center text-xs text-white/30">
              <p>El tema se guardará automáticamente en tu dispositivo.</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
