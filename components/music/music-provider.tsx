'use client'

import React, { createContext, useContext, useState } from 'react'
import { MusicSidebar } from '@/components/music/music-sidebar'

interface MusicContextType {
  isMusicOpen: boolean
  toggleMusic: () => void
  closeMusic: () => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [isMusicOpen, setIsMusicOpen] = useState(false)

  return (
    <MusicContext.Provider value={{
      isMusicOpen,
      toggleMusic: () => setIsMusicOpen(prev => !prev),
      closeMusic: () => setIsMusicOpen(false),
    }}>
      {children}
      <MusicSidebar isOpen={isMusicOpen} onClose={() => setIsMusicOpen(false)} />
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider')
  }
  return context
}
