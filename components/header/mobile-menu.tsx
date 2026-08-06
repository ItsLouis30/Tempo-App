"use client"

import React, { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

interface MobileMenuProps {
  children: React.ReactNode
}

export function MobileMenu({ children }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const labels = [
    "Compartir tablero",
    "Personalización",
    "Ambiente y Música",
    "Recordatorios",
    "Perfil de usuario"
  ]
  const childrenArray = React.Children.toArray(children)

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:text-white rounded-full bg-white/10 border border-white/20 shadow-sm transition-all relative z-[60]"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="absolute top-20 right-6 flex flex-col gap-4 items-end"
            onClick={e => e.stopPropagation()} // Prevent clicking the buttons from closing the overlay
          >
            {childrenArray.map((child, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 animate-in slide-in-from-top-8 fade-in fill-mode-both duration-300"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                {/* Text Label */}
                <span className="text-white/90 text-sm font-medium bg-[#1C1C1E]/80 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg">
                  {labels[i]}
                </span>
                {/* Floating Button Wrapper */}
                <div className={`bg-[#1C1C1E]/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 flex items-center justify-center w-14 h-14 ${i !== 4 ? '[&_button]:!bg-transparent [&_button]:!border-transparent [&_button]:!shadow-none [&_svg]:!w-6 [&_svg]:!h-6 [&_svg]:!text-white' : ''}`}>
                  {child}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
