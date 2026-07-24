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
        className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-[420px] bg-white/5 backdrop-blur-3xl border-l border-white/10 shadow-2xl p-6 transform transition-all duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <h2 className="text-xs font-bold text-white/50 tracking-[0.2em] uppercase">Música & Ambiente</h2>
        </div>

        {/* Ambient Sounds Section - Container */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-4 px-1">
            <h3 className="text-sm font-semibold text-white/90">Mezclador de Ambiente</h3>
            <span title="Ajusta el volumen para combinar sonidos y crear tu ambiente ideal.">
              <Info className="h-4 w-4 text-white/40 cursor-help" />
            </span>
          </div>

          <div className="flex flex-col gap-6 px-1">
            {ambientSounds.map(sound => {
              const isActive = sound.volume > 0;
              return (
                <div key={sound.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Volume2 className={`h-4 w-4 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-white/40'
                    }`} />
                    <span className={`text-sm flex-1 font-medium transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-white/60'
                    }`}>
                      {sound.name}
                    </span>
                    <span className={`text-xs transition-colors duration-300 ${
                      isActive ? 'text-white font-bold' : 'text-white/30'
                    }`}>
                      {sound.volume}%
                    </span>
                  </div>
                  <div className="px-7">
                    <Slider
                      value={[sound.volume]}
                      onValueChange={newVolume => handleVolumeChange(sound.id, newVolume)}
                      max={100}
                      step={1}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Spotify Playlist Section - Container */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 px-1">
            <h3 className="text-sm font-semibold text-white/90">Playlist de Spotify</h3>
            <span title="Copia el enlace de la playlist desde Spotify">
              <Info className="h-4 w-4 text-white/40 cursor-help" />
            </span>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Pega aquí el link de tu playlist pública..."
              value={playlistUrl}
              onChange={e => setPlaylistUrl(e.target.value)}
              className="w-full h-10 px-3 bg-white/5 border border-green/10 rounded text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
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

          <p className="text-[12px] text-white/50 leading-relaxed mt-4">
            Para escuchar canciones completas aquí, inicia sesión en Spotify con el mismo navegador. Caso contrario solo escucharás 30 segundos de canción.
          </p>

          {embedUrl && (
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-[#1db954] hover:text-[#1ed760] transition-colors"
            >
              Abrir en Spotify →
            </a>
          )}

          {/* Quick Playlists */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <h4 className="text-[10px] font-bold text-white/40 mb-3 uppercase tracking-widest">Sugerencias Rápidas</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Lofi Study", url: "https://open.spotify.com/playlist/6zCID88oNjNv9zx6puDHKj" },
                { name: "Intense Study", url: "https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6" },
                { name: "House Focus", url: "https://open.spotify.com/playlist/37i9dQZF1DX8wtrGDH81Oa" },
                { name: "Binaural Beats", url: "https://open.spotify.com/playlist/37i9dQZF1DX7EF8wVxBVhG" },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPlaylistUrl(p.url)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
