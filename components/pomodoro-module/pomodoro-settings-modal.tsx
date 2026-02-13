"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PomodoroSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  task: {
    id: string
    pomodoro_duration: number
    short_break_duration: number
    long_break_duration: number
    pomodoro_cycles: number
  }
  onSettingsSaved: () => void
}

export function PomodoroSettingsModal({
  isOpen,
  onClose,
  task,
  onSettingsSaved,
}: PomodoroSettingsModalProps) {
  const supabase = createClient()
  const [pomodoroDuration, setPomodoroDuration] = useState(task.pomodoro_duration)
  const [shortBreakDuration, setShortBreakDuration] = useState(task.short_break_duration)
  const [longBreakDuration, setLongBreakDuration] = useState(task.long_break_duration)
  const [pomodorosCycles, setPomodorosCycles] = useState(task.pomodoro_cycles)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await supabase
        .from("tasks")
        .update({
          pomodoro_duration: pomodoroDuration,
          short_break_duration: shortBreakDuration,
          long_break_duration: longBreakDuration,
          pomodoro_cycles: pomodorosCycles,
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
          <h2 className="text-xl font-bold text-white">Configurar Pomodoro</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pomodoro Duration */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Duración del Pomodoro (minutos)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="60"
                value={pomodoroDuration}
                onChange={(e) => setPomodoroDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-[#2D2D2D] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
              <span className="text-white/60 text-sm">min</span>
            </div>
          </div>

          {/* Short Break Duration */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Descanso Corto (minutos)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-[#2D2D2D] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
              <span className="text-white/60 text-sm">min</span>
            </div>
          </div>

          {/* Long Break Duration */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Descanso Largo (minutos)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="60"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-[#2D2D2D] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
              <span className="text-white/60 text-sm">min</span>
            </div>
          </div>

          {/* Pomodoro Cycles */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Número de Ciclos
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="10"
                value={pomodorosCycles}
                onChange={(e) => setPomodorosCycles(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-[#2D2D2D] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
              <span className="text-white/60 text-sm">ciclos</span>
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
            className="flex-1 px-4 py-2 bg-[#974949] text-black rounded-lg hover:bg-white/90 transition-colors font-medium disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}
