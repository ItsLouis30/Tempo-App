"use client"

import React, { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Loader2, Check, FilePenLine} from "lucide-react"

export function QuickNotesWidget() {
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch initial notes
  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("quick_notes").eq("id", user.id).single()
        if (data && data.quick_notes !== null) {
          setNotes(data.quick_notes)
        }
        setIsLoaded(true)
      }
    }
    fetchNotes()
  }, [])

  // Handle save
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setNotes(newValue)
    setIsSaving(true)
    setIsSaved(false)

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("profiles").update({ quick_notes: newValue }).eq("id", user.id)
        setIsSaving(false)
        setIsSaved(true)
        
        setTimeout(() => setIsSaved(false), 2000)
      }
    }, 1000) // 1 second debounce
  }

  return (
    <div className="glass-card flex flex-col p-6 group shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
          <FilePenLine className="w-4 h-4 text-blue-400" />
          Bloc de Notas
        </h4>
        <div className="text-xs text-white/40 flex items-center h-4">
          {!isLoaded ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isSaving ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
            </span>
          ) : isSaved ? (
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" /> Guardado
            </span>
          ) : null}
        </div>
      </div>
      
      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Escribe aquí ideas rápidas, números, o enlaces que no quieras olvidar..."
        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none transition-all scrollbar-thin scrollbar-thumb-white/10"
      />
    </div>
  )
}
