"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Play, Pause, SquarePen, Coffee, PlusCircle, Volume2, VolumeX } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { CronometroSettingsModal } from "./cronometro-settings-modal"
import { CronometroCompletionModal } from "./completion-modal-cronometro"

interface Task {
  id: string
  title: string
  user_id: string
  progress: number
  total_focus_time: number
  is_running: boolean
  status: string
  estimated_minutes: number
}

interface CronometroTimerClientProps {
  task: Task
  userId: string
}

interface TaskNote {
  id: string
  task_id: string
  user_id: string
  content: string
  position: number
  created_at: string
}

type SessionType = "work" | "break"

export function CronometroTimerClient({ task, userId }: CronometroTimerClientProps) {
  const supabase = createClient()
  const sessionStartTimeRef = useRef<number | null>(null)

  const [sessionType, setSessionType] = useState<SessionType>("work")
  const [timeLeft, setTimeLeft] = useState((task.estimated_minutes || 0) * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [totalFocusTime, setTotalFocusTime] = useState(task.total_focus_time || 0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [notes, setNotes] = useState<TaskNote[]>([])
  const [isLoadingNotes, setIsLoadingNotes] = useState(true)
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimated_minutes || 0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const BREAK_DURATION = 5 * 60

  const getSessionDuration = useCallback((type: SessionType) => {
    return type === "work" ? estimatedMinutes * 60 : BREAK_DURATION
  }, [estimatedMinutes])

  // Save actual elapsed time when work session completes
  const saveActualFocusTime = useCallback(
    async (elapsedMinutes: number) => {
      const newFocusTime = (totalFocusTime || 0) + elapsedMinutes
      setTotalFocusTime(newFocusTime)

      const { error } = await supabase
        .from("tasks")
        .update({ total_focus_time: newFocusTime })
        .eq("id", task.id)

      if (error) {
        console.error("Error saving focus time:", error)
      }
    },
    [totalFocusTime, task.id, supabase]
  )

  const handleSessionCompletion = useCallback(async () => {
    if (sessionType === "work") {
      // Calculate actual elapsed time
      if (!sessionStartTimeRef.current) return
      const elapsedSeconds = Math.floor(
        (Date.now() - sessionStartTimeRef.current) / 1000
      )
      const elapsedMinutes = Math.floor(elapsedSeconds / 60)

      if (elapsedMinutes > 0) {
        await saveActualFocusTime(elapsedMinutes)
      }

      // Show completion modal after work session
      setShowCompletionModal(true)
      sessionStartTimeRef.current = null
      setIsRunning(false)
    } else if (sessionType === "break") {
      // After break, reset to work session
      setSessionType("work")
      setTimeLeft(estimatedMinutes * 60)
      sessionStartTimeRef.current = Date.now()
    }
  }, [sessionType, saveActualFocusTime, estimatedMinutes])

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      const { data } = await supabase
        .from("task_notes")
        .select("*")
        .eq("task_id", task.id)
        .order("position", { ascending: true })
      if (data) setNotes(data)
      setIsLoadingNotes(false)
    }
    loadNotes()
  }, [task.id, supabase])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          playNotificationSound()
          handleSessionCompletion()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, handleSessionCompletion])

  useEffect(() => {
    audioRef.current = new Audio('/sounds/notificationtimer.mp3')
    audioRef.current.volume = 0.6
  }, [])

  const playNotificationSound = () => {
    if (isMuted) return
    audioRef.current?.play().catch((err) => {
      console.log('Audio error:', err)
    })
  }

  const switchSession = (type: SessionType) => {
    setSessionType(type)
    setTimeLeft(getSessionDuration(type))
    setIsRunning(false)
  }

  const handleSettingsSaved = async () => {
    // Refresh task data to get updated estimated_minutes
    const { data: updatedTask } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", task.id)
      .single()

    if (updatedTask) {
      setEstimatedMinutes(updatedTask.estimated_minutes)
      // Reset timer to new duration if on work session
      if (sessionType === "work") {
        setTimeLeft(updatedTask.estimated_minutes * 60)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return

    const position = notes.length > 0 ? Math.max(...notes.map((n) => n.position)) + 1 : 0
    const { data, error } = await supabase
      .from("task_notes")
      .insert({
        task_id: task.id,
        user_id: userId,
        content: newNoteContent,
        position,
      })
      .select()

    if (data && data[0]) {
      setNotes([...notes, data[0]])
      setNewNoteContent("")
    }
    if (error) console.error("Error adding note:", error)
  }

  const handleDeleteNote = async (noteId: string) => {
    await supabase.from("task_notes").delete().eq("id", noteId)
    setNotes(notes.filter((n) => n.id !== noteId))
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto text-white font-sans">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-4 text-sm font-medium opacity-80">
          <Link href="/dashboard" className="hover:underline">
            Inicio
          </Link>
          <span>&gt;</span>
          <span className="uppercase tracking-wider">{task.title}</span>
        </nav>

        {/* Main Timer Area */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-2xl font-semibold mb-4 drop-shadow-lg">Cronómetro Libre</h1>

          <div className="text-[10rem] md:text-[11rem] font-bold leading-none mb-6 tracking-tighter tabular-nums drop-shadow-lg">
            {formatTime(timeLeft)}
          </div>

          {/* Session Type Indicator */}
          <div className="mb-6 text-lg font-medium text-white/80">
            {sessionType === "work" && "Elige tu tiempo de enfoque personalizado"}
            {sessionType === "break" && "Descansito"}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => {
                if (!isRunning) {
                  sessionStartTimeRef.current = Date.now()
                }
                setIsRunning(!isRunning)
              }}
              className="flex items-center gap-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] px-10 py-3 rounded-md transition-all active:scale-95 shadow-xl"
            >
              {isRunning ? (
                <Pause size={22} fill="currentColor" />
              ) : (
                <Play size={22} fill="currentColor" />
              )}
              <span className="font-medium text-lg">{isRunning ? "Pausa" : "Iniciar"}</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] px-6 py-3 rounded-md transition-all border border-white/5"
            >
              <SquarePen size={20} />
              <span className="font-medium">Editar</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center justify-center bg-[#2D2D2D] hover:bg-[#3D3D3D] w-12 rounded-md transition-all"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>

        {/* Session Selectors */}
        <div className="flex justify-center w-full mb-7">
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl px-4 justify-center">
            <button
              onClick={() => switchSession("work")}
              className={`flex items-center justify-between p-6 rounded-xl transition-all border-2 min-w-[200px] flex-1 ${
                sessionType === "work"
                  ? "bg-[#2D2D2D] border-white/20 shadow-lg"
                  : "bg-[#2D2D2D]/40 border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <div className="bg-[#3D3D3D] p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-lg">Manos a la obra</p>
                <p className="opacity-70 text-sm">{estimatedMinutes} min</p>
              </div>
            </button>

            <button
              onClick={() => switchSession("break")}
              className={`flex items-center justify-between p-6 rounded-xl transition-all border-2 min-w-[200px] flex-1 ${
                sessionType === "break"
                  ? "bg-[#2D2D2D] border-white/20 shadow-lg"
                  : "bg-[#2D2D2D]/40 border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <div className="bg-[#3D3D3D] p-3 rounded-full">
                <Coffee size={32} />
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-lg">Descansito</p>
                <p className="opacity-70 text-sm">5 min</p>
              </div>
            </button>
          </div>
        </div>

        {/* Annotations Section */}
        <div className="border border-white/10 rounded-xl p-6 bg-black/10 backdrop-blur-sm flex flex-col gap-4">
          {/* Listado de Notas*/}
          <div className="flex flex-wrap items-start gap-3">
            {isLoadingNotes ? (
              <p className="text-white/40 text-sm italic">Cargando...</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#D4D9A1] border border-black/5 rounded-md shadow-sm group transition-all shrink-0"
                >
                  <div className="grid grid-cols-2 gap-0.5 opacity-40">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-black rounded-full" />
                    ))}
                  </div>

                  <p className="text-sm text-[#2D2D2D] font-medium">{note.content}</p>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-black/40 hover:text-red-600 transition-all text-[10px] ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Área de Input*/}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
            <input
              type="text"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
              placeholder="Escribe aquí..."
              className="w-32 focus:w-48 transition-all bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />

            <button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
              className="flex items-center gap-2 bg-[#40446B] hover:bg-[#4C5076] disabled:opacity-50 px-3 py-1.5 rounded-md text-sm text-white/90 border border-white/10 shadow-sm transition-colors"
            >
              <PlusCircle size={16} />
              <span>Añadir anotación</span>
            </button>
          </div>
        </div>

        {/* Stats Quick View */}
        <div className="mt-6 flex justify-between text-xs uppercase tracking-widest opacity-40 font-bold">
          <span>Enfoque total: {totalFocusTime}m</span>
          <span>Tiempo estimado: {estimatedMinutes}m</span>
        </div>
      </div>

      {/* Settings Modal */}
      <CronometroSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        task={task}
        onSettingsSaved={handleSettingsSaved}
      />

      {/* Completion Modal */}
      <CronometroCompletionModal
        isOpen={showCompletionModal}
        taskId={task.id}
        taskTitle={task.title}
        totalFocusTime={totalFocusTime}
        onTaskComplete={() => {
          setShowCompletionModal(false)
        }}
        onAddMoreTime={(additionalMinutes: number) => {
          setEstimatedMinutes(additionalMinutes)
          setTimeLeft(additionalMinutes * 60)
          setShowCompletionModal(false)
          sessionStartTimeRef.current = null
        }}
      />
    </>
  )
}
