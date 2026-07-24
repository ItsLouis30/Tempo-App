"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
      <Link 
        href="/dashboard" 
        className={`text-sm font-medium px-5 py-1.5 rounded-full transition-all ${
          pathname === "/dashboard" 
            ? "bg-white text-black shadow-sm" 
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
      >
        Inicio
      </Link>
      <Link 
        href="/dashboard/calendario" 
        className={`text-sm font-medium px-5 py-1.5 rounded-full transition-all ${
          pathname === "/dashboard/calendario" 
            ? "bg-white text-black shadow-sm" 
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
      >
        Calendario
      </Link>
    </nav>
  )
}
