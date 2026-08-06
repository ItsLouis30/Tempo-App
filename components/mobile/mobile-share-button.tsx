"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Share2, Link as LinkIcon, Check, X, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface MobileShareButtonProps {
  userId: string
}

export function MobileShareButton({ userId }: MobileShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load existing token if any
  useEffect(() => {
    if (!isOpen) return
    const fetchToken = async () => {
      setIsLoading(true)
      const { data } = await supabase
        .from("shared_links")
        .select("token")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single()
      
      if (data) {
        setToken(data.token)
      }
      setIsLoading(false)
    }
    fetchToken()
  }, [isOpen, userId, supabase])

  const generateLink = async () => {
    setIsLoading(true)
    const newToken = "tempo-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    
    const { data: existing } = await supabase
      .from("shared_links")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (existing) {
      await supabase
        .from("shared_links")
        .update({ token: newToken, is_active: true })
        .eq("id", existing.id)
    } else {
      await supabase
        .from("shared_links")
        .insert({ user_id: userId, token: newToken, is_active: true })
    }

    setToken(newToken)
    setIsLoading(false)
  }

  const deactivateLink = async () => {
    setIsLoading(true)
    await supabase
      .from("shared_links")
      .update({ is_active: false })
      .eq("user_id", userId)
    
    setToken(null)
    setIsLoading(false)
  }

  const copyToClipboard = () => {
    if (!token) return
    const url = `${window.location.origin}/shared/${token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-full flex items-center justify-center text-white bg-transparent border-none shadow-none"
      >
        <Share2 size={24} />
      </button>

      {isOpen && mounted && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] animate-in fade-in duration-200" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/5 backdrop-blur-3xl rounded-t-3xl border-t border-white/10 w-full shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Mobile handle indicator */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-6 mb-2" />
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 pt-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Share2 size={20} className="text-blue-400" />
                Compartir Tablero
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <p className="text-white/70 text-sm leading-relaxed">
                Genera un enlace público de solo lectura para compartir tus tareas. Los visitantes podrán ver tu progreso sin necesidad de tener una cuenta, pero no podrán hacer cambios.
              </p>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              ) : token ? (
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                    <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2 block">
                      Enlace público activo
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="bg-black/40 px-3 py-2 rounded-lg text-sm text-white/90 truncate flex-1 font-mono border border-white/5">
                        {`${window.location.origin}/shared/${token}`}
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors shrink-0 flex items-center justify-center"
                        title="Copiar al portapapeles"
                      >
                        {copied ? <Check size={18} /> : <LinkIcon size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertTriangle size={16} className="shrink-0" />
                    <p>Cualquier persona con este enlace podrá ver tus tareas.</p>
                  </div>
                  
                  <button
                    onClick={deactivateLink}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all font-medium border border-white/10 text-sm"
                  >
                    Desactivar enlace
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <Share2 size={24} className="text-white/50" />
                  </div>
                  <button
                    onClick={generateLink}
                    className="w-full py-3 bg-white text-black hover:bg-white/90 rounded-xl transition-all font-medium shadow-lg hover:scale-[1.02]"
                  >
                    Generar enlace público
                  </button>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
