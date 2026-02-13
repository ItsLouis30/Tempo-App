"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PomodoroCompletionModalProps {
  isOpen: boolean
  taskId: string
  taskTitle: string
  totalFocusTime: number
  currentCycles: number
  onTaskComplete: () => void
  onAddMoreCycles: (extraCycles: number) => void
}

export function PomodoroCompletionModal({
  isOpen,
  taskId,
  taskTitle,
  totalFocusTime,
  currentCycles,
  onTaskComplete,
  onAddMoreCycles,
}: PomodoroCompletionModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [extraCycles, setExtraCycles] = useState(1)

  const handleCompleteTask = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "done",
          progress: 100,
        })
        .eq("id", taskId)

      if (error) {
        console.error("Error completing task:", error)
        return
      }

      onTaskComplete()
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueWorkout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          pomodoro_cycles: extraCycles,
          completed_cycles: 0,
          total_focus_time: 0,
          progress: 0,
        })
        .eq("id", taskId)

      if (error) {
        console.error("Error updating task:", error)
        return
      }

      onAddMoreCycles(extraCycles)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F1F1F] rounded-xl border border-white/10 w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header with Icon */}
        <div className="bg-gradient-to-r from-[#8B4444] to-[#6B3434] p-6 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Check size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">¡Excelente trabajo!</h2>
            <p className="text-white/70 text-sm">Completaste todos los ciclos</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Title */}
          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <p className="text-white/60 text-xs tracking-wider font-medium mb-1">Tarea</p>
            <p className="text-white font-semibold text-lg">{taskTitle}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2D2D2D] p-4 rounded-lg">
              <p className="text-white/60 text-xs tracking-wider font-medium mb-1">
                Tiempo Total
              </p>
              <p className="text-white font-bold text-2xl">{totalFocusTime}m</p>
            </div>
            <div className="bg-[#2D2D2D] p-4 rounded-lg">
              <p className="text-white/60 text-xs tracking-wider font-medium mb-1">
                Ciclos
              </p>
              <p className="text-white font-bold text-2xl">{currentCycles}</p>
            </div>
          </div>

          {/* Question */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-white font-semibold mb-4">¿Terminaste esta tarea?</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 p-6 bg-black/10 border-t border-white/10">
          {/* Mark as Done */}
          <button
            onClick={handleCompleteTask}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#345E3C] hover:bg-[#3E7048] disabled:opacity-50 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Check size={20} />
            {isLoading ? "Procesando..." : "Sí, Marcar como hecho"}
          </button>

          {/* Add More Cycles */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm font-medium flex-1">
                No, agregar más ciclos:
              </label>
              <select
                value={extraCycles}
                onChange={(e) => setExtraCycles(Number(e.target.value))}
                disabled={isLoading}
                className="bg-[#2D2D2D] border border-white/10 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-white/30"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} ciclo{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleContinueWorkout}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#8B4444] hover:bg-[#7A3D3D] disabled:opacity-50 text-white rounded-lg transition-colors font-semibold"
            >
              {isLoading ? "Procesando..." : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
