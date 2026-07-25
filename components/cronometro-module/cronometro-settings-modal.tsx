"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CronometroSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  task: {
    id: string
    estimated_minutes: number
  }
  onSettingsSaved: () => void
}

export function CronometroSettingsModal({
  isOpen,
  onClose,
  task,
  onSettingsSaved,
}: CronometroSettingsModalProps) {
  const supabase = createClient()
  const [cronometroDuration, setCronometroDuration] = useState(task.estimated_minutes)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await supabase
        .from("tasks")
        .update({
          estimated_minutes: cronometroDuration,
        })
        .eq("id", task.id)

      onSettingsSaved()
      onClose()
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Configurar Cronómetro</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Duración del cronómetro (minutos)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="900"
                value={cronometroDuration}
                onChange={(e) => setCronometroDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/30 shadow-inner transition-all"
              />
              <span className="text-white/60 text-sm">min</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10 bg-black/20">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/90 rounded-xl transition-all font-medium border border-white/5 shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 bg-white text-black rounded-xl hover:bg-white/90 transition-all font-medium disabled:opacity-50 shadow-lg scale-100 hover:scale-[1.02]"
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  )
}
