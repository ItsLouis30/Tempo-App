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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F1F1F] rounded-xl border border-white/10 w-full max-w-md shadow-2xl">
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
                className="flex-1 bg-[#2D2D2D] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
              <span className="text-white/60 text-sm">min</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-[#40446B] text-white rounded-lg hover:bg-[#4C5076] transition-colors font-medium disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}
