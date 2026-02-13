'use client'

import type React from "react"
import { useMusic } from "@/components/music/music-provider"

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isMusicOpen } = useMusic()

  return (
    <main className={`transition-all duration-300 ease-in-out ${isMusicOpen ? 'mr-72' : 'mr-0'}`}>
      {children}
    </main>
  )
}
