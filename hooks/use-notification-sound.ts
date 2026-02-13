'use client';

import { useCallback } from 'react'

export function useNotificationSound() {
  const playSound = useCallback((soundFile: string = 'sounds/notification.mp3') => {
    try {
      const audio = new Audio(`/${soundFile}`)
      audio.volume = 0.5
      audio.play().catch((error) => {
        console.log('Could not play sound:', error.message)
      })
    } catch (error) {
      console.log('Sound playback error:', error)
    }
  }, [])

  return { playSound }
}
