"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CalendarDays } from "lucide-react"

export function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
      <Link 
        href="/dashboard" 
        className={`flex items-center justify-center gap-2 text-sm font-medium w-10 h-10 lg:w-auto lg:h-auto lg:px-5 lg:py-1.5 rounded-full transition-all ${
          pathname === "/dashboard" 
            ? "bg-white text-black shadow-sm" 
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="hidden lg:inline">Inicio</span>
      </Link>
      <Link 
        href="/dashboard/calendario" 
        className={`flex items-center justify-center gap-2 text-sm font-medium w-10 h-10 lg:w-auto lg:h-auto lg:px-5 lg:py-1.5 rounded-full transition-all ${
          pathname === "/dashboard/calendario" 
            ? "bg-white text-black shadow-sm" 
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        <span className="hidden lg:inline">Calendario</span>
      </Link>
    </nav>
  )
}
