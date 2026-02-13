'use client'

import { Music } from 'lucide-react'
import { useMusic } from '@/components/music/music-provider'

export function MusicButton() {
  const { toggleMusic, isMusicOpen } = useMusic()

  return (
    <button
      onClick={toggleMusic}
      className="relative p-2 hover:bg-accent rounded-md transition-colors"
      aria-label="Toggle música"
    >
      <Music className="h-5 w-5" />
    </button>
  )
}
