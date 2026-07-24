'use client'

import { useState } from 'react'
import { X, Volume2, Info } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import {useRef, useEffect} from 'react'

interface AmbientSound {
  id: string
  name: string
  volume: number
}

function toSpotifyEmbed(url: string) {
  if (!url || !url.includes('spotify.com')) return null;
  
  try {
    //Extraemos playlist y el ID
    const match = url.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
    
    if (match) {
      const [, type, id] = match;
      return `https://open.spotify.com/embed/${type}/${id}`;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function MusicSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([
    { id: 'rain', name: 'Lluvia', volume: 0 },
    { id: 'water', name: 'Agua', volume: 0 },
    { id: 'birds', name: 'Canto de Pájaros', volume: 0 },
    { id: 'fireplace', name: 'Chimenea', volume: 0 },
  ])
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  useEffect(() => {
  ambientSounds.forEach(sound => {
    if (!audioRefs.current[sound.id]) {
      const audio = new Audio(`/sounds/${sound.id}.wav`)
      audio.loop = true
      audio.volume = 0
      audioRefs.current[sound.id] = audio
    }
  })

  return () => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
  }
}, [])


  const [playlistUrl, setPlaylistUrl] = useState('')

  const handleVolumeChange = (id: string, newVolume: number[]) => {
  const volume = newVolume[0]

  setAmbientSounds(sounds =>
    sounds.map(sound =>
      sound.id === id ? { ...sound, volume } : sound
    )
  )

  const audio = audioRefs.current[id]
  if (!audio) return

  audio.volume = volume / 100

  if (volume > 0) {
    audio.play().catch(() => {})
  } else {
    audio.pause()
    audio.currentTime = 0
  }
}
  const embedUrl = toSpotifyEmbed(playlistUrl)


  return (
    <>
      {/* Sidebar - From Right, below header */}
      <aside
        className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-[420px] bg-black/60 backdrop-blur-2xl border-l border-white/10 p-6 transform transition-all duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-sm font-semibold text-white/90 tracking-wide uppercase">Música & Ambiente</h2>
        </div>

        {/* Ambient Sounds Section - Container */}
        <div className="mb-6 glass-card p-5 border-none bg-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-white/90">Sonidos de Ambiente</h3>
            <span title="Si te gustan los sonidos, ajusta el volumen a tu preferencia. ">
              <Info className="h-4 w-4 text-white/40 cursor-help" />
            </span>
          </div>

          <div className="space-y-3">
            {ambientSounds.map(sound => (
              <div key={sound.id} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-white/70 flex-shrink-0" />
                  <span className="text-sm text-white/90 flex-1">{sound.name}</span>
                  <span className="text-xs text-white/50">{sound.volume}%</span>
                </div>
                <div className="px-1">
                  <Slider
                    value={[sound.volume]}
                    onValueChange={newVolume => handleVolumeChange(sound.id, newVolume)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spotify Playlist Section - Container */}
        <div className="glass-card p-5 border-none bg-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-white/90">Playlist de Spotify</h3>
            <span title="Copia el enlace de la playlist desde Spotify">
              <Info className="h-4 w-4 text-white/40 cursor-help" />
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Link de playlist pública"
              value={playlistUrl}
              onChange={e => setPlaylistUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-black/30 border border-white/10 shadow-inner rounded-md text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
            />
          </div>

          {/* Error */}
          {playlistUrl && !embedUrl && (
            <p className="text-xs text-red-400/80 animate-pulse">
              Pega un enlace válido de Spotify
            </p>
          )}

          {embedUrl && (
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <iframe
                src={embedUrl}
                width="100%"
                height="152"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: '12px' }}
              />
            </div>
          )}

          <p className="text-[12px] text-white/50 leading-relaxed">
            Para escuchar canciones completas aquí, inicia sesión en Spotify con el mismo navegador. Caso contrario solo escucharás 30 segundos de canción.
          </p>

          {embedUrl && (
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-[#1db954] hover:text-[#1ed760] transition-colors"
            >
              Abrir en Spotify →
            </a>
          )}      
        </div>
      </aside>
    </>
  )
}
