"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Play, Pause, SquarePen, Coffee, Timer, Clock, PlusCircle, Volume2, VolumeX, SkipForward } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { PomodoroSettingsModal } from "@/components/pomodoro-module/pomodoro-settings-modal"
import { PomodoroCompletionModal } from "@/components/pomodoro-module/completion-modal-pomodoro"

interface Task {
  id: string
  title: string
  user_id: string
  progress: number
  total_focus_time: number
  is_running: boolean
  status: string
  pomodoro_cycles: number
  completed_cycles: number
  pomodoro_duration: number
  short_break_duration: number
  long_break_duration: number
}

interface PomodoroTimerClientProps {
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

type SessionType = "pomodoro" | "short_break" | "long_break"

export function PomodoroTimerClient({ task, userId }: PomodoroTimerClientProps) {
  const supabase = createClient()
  const startTimeRef = useRef<number | null>(null)
  const sessionStartTimeRef = useRef<number | null>(null)

  const [sessionType, setSessionType] = useState<SessionType>("pomodoro")
  const [timeLeft, setTimeLeft] = useState(task.pomodoro_duration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [currentCycle, setCurrentCycle] = useState((task.completed_cycles || 0) + 1)
  const [totalFocusTime, setTotalFocusTime] = useState(task.total_focus_time)
  const [isMuted, setIsMuted] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completedAllCycles, setCompletedAllCycles] = useState(false)
  const [settings, setSettings] = useState({
    pomodoro_duration: task.pomodoro_duration,
    short_break_duration: task.short_break_duration,
    long_break_duration: task.long_break_duration,
    pomodoro_cycles: task.pomodoro_cycles,
  })
  const [newNoteContent, setNewNoteContent] = useState("")
  const [notes, setNotes] = useState<TaskNote[]>([])
  const [isLoadingNotes, setIsLoadingNotes] = useState(true)
  const [completedCycles, setCompletedCycles] = useState(task.completed_cycles || 0)
  const completedCyclesRef = useRef(task.completed_cycles || 0)
  const isUnmountingRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    completedCyclesRef.current = completedCycles
  }, [completedCycles])

  const getSessionDuration = useCallback((type: SessionType) => {
    if (type === "pomodoro") return settings.pomodoro_duration * 60
    if (type === "short_break") return settings.short_break_duration * 60
    return settings.long_break_duration * 60
  }, [settings])

  // Calculate progress based on completed cycles
  const calculateProgress = useCallback((cycles: number): number => {
    if (settings.pomodoro_cycles === 0) return 0
    return Math.floor((cycles / settings.pomodoro_cycles) * 100)
  }, [settings.pomodoro_cycles])

  // Save progress and completed cycles when abandoning pomodoro
  const saveProgressOnAbandon = useCallback(async () => {
    const cycleCount = completedCyclesRef.current
    const progress = calculateProgress(cycleCount)
    
    console.log("Saving progress on abandon - cycles:", cycleCount, "progress:", progress)
    
    const { error } = await supabase
      .from("tasks")
      .update({
        completed_cycles: cycleCount,
        progress,
      })
      .eq("id", task.id)

    if (error) {
      console.error("Error saving progress on abandon:", error)
    } else {
      console.log("Progress saved successfully")
    }
  }, [task.id, supabase, calculateProgress])

  // Save actual elapsed time when pomodoro completes
  const saveActualFocusTime = useCallback(async (elapsedMinutes: number) => {
    const newFocusTime = (totalFocusTime ?? 0) + elapsedMinutes
    setTotalFocusTime(newFocusTime)

    const { error } = await supabase
      .from("tasks")
      .update({ total_focus_time: newFocusTime })
      .eq("id", task.id)

    if (error) {
      console.error("Error saving focus time:", error)
    }
  }, [totalFocusTime, task.id, supabase])

  const handleSessionCompletion = useCallback(async () => {
    if (sessionType === "pomodoro") {
      // Calculate actual elapsed time
      if (!sessionStartTimeRef.current) return
      const elapsedSeconds = Math.floor(
        (Date.now() - sessionStartTimeRef.current) / 1000
      )
      const elapsedMinutes = Math.floor(elapsedSeconds / 60)

      if (elapsedMinutes <= 0) return
      await saveActualFocusTime(elapsedMinutes)

      // Increment completed cycles
      setCompletedCycles(prev => prev + 1)

      // Check if last cycle
      if (currentCycle === settings.pomodoro_cycles) {
        setSessionType("long_break")
        setTimeLeft(getSessionDuration("long_break"))
        sessionStartTimeRef.current = Date.now()
      } else {
        setSessionType("short_break")
        setTimeLeft(getSessionDuration("short_break"))
        sessionStartTimeRef.current = Date.now()
      }
    } 
    else if (sessionType === "short_break") {
      const nextCycle = currentCycle + 1
      setCurrentCycle(nextCycle)
      setSessionType("pomodoro")
      setTimeLeft(getSessionDuration("pomodoro"))
      sessionStartTimeRef.current = Date.now()
    } 
    else if (sessionType === "long_break") {
      // All cycles completed!
      setShowCompletionModal(true)
      setCompletedAllCycles(true)
      sessionStartTimeRef.current = null
    }
  }, [currentCycle, sessionType, settings, saveActualFocusTime, getSessionDuration])

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

  // Save progress when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Save completed cycles and progress when leaving the pomodoro page
      saveProgressOnAbandon()
    }
  }, [saveProgressOnAbandon])

  // Track session start time when running starts
  useEffect(() => {
    if (isRunning && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now()
    }
  }, [isRunning])

  // Timer interval
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          playNotificationSound()
          handleSessionCompletion()
          sessionStartTimeRef.current = null
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



  const skipSession = async () => {
    if (sessionType === "pomodoro" && sessionStartTimeRef.current) {
      const elapsedSeconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
      const elapsedMinutes = Math.floor(elapsedSeconds / 60)
      if (elapsedMinutes > 0) {
        await saveActualFocusTime(elapsedMinutes)
      }
    }

    if (sessionType === "pomodoro") {
      if (currentCycle === settings.pomodoro_cycles) {
        setSessionType("long_break")
        setTimeLeft(getSessionDuration("long_break"))
      } else {
        setSessionType("short_break")
        setTimeLeft(getSessionDuration("short_break"))
      }
    } else if (sessionType === "short_break") {
      const nextCycle = currentCycle + 1
      setCurrentCycle(nextCycle)
      setSessionType("pomodoro")
      setTimeLeft(getSessionDuration("pomodoro"))
    } else if (sessionType === "long_break") {
      setShowCompletionModal(true)
      setCompletedAllCycles(true)
    }
    
    setIsRunning(false)
    sessionStartTimeRef.current = null
  }

  const switchSession = (type: SessionType) => {
    setSessionType(type)
    setTimeLeft(getSessionDuration(type))
    setIsRunning(false)
  }

  const handleSettingsSaved = async () => {
    const { data: updatedTask } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", task.id)
      .single()
    
    if (updatedTask) {
      setSettings({
        pomodoro_duration: updatedTask.pomodoro_duration,
        short_break_duration: updatedTask.short_break_duration,
        long_break_duration: updatedTask.long_break_duration,
        pomodoro_cycles: updatedTask.pomodoro_cycles,
      })
      if (sessionType === "pomodoro") {
        setTimeLeft(updatedTask.pomodoro_duration * 60)
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

    const position = notes.length > 0 ? Math.max(...notes.map(n => n.position)) + 1 : 0
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
    setNotes(notes.filter(n => n.id !== noteId))
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto text-white font-sans">

        {/* Main Timer Area */}
        <div className="flex flex-col items-center mb-12 pt-4">
          
          {/* Task Title Pill */}
          <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm mb-4">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Tarea:</span>
            <span className="font-bold text-white tracking-wide text-sm">{task.title}</span>
          </div>
          
          <div className="bg-white/5 px-4 py-1 rounded-full text-xs mb-8 font-medium backdrop-blur-sm border border-white/10 text-white/70 uppercase tracking-widest">
            Ciclo #{currentCycle} / {settings.pomodoro_cycles}
          </div>
          
          <div className="text-[10rem] md:text-[11rem] font-bold leading-none mb-8 tracking-tighter tabular-nums drop-shadow-lg text-white">
            {formatTime(timeLeft)}
          </div>

          {/* Session Type Indicator */}
          <div className="mb-6 text-lg font-medium text-white/80 uppercase tracking-wider">
            {sessionType === "pomodoro" && "Pomodoro"}
            {sessionType === "short_break" && "Descanso Corto"}
            {sessionType === "long_break" && "Descanso Largo"}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-10 py-3 rounded-full transition-all active:scale-95 shadow-sm text-white"
            >
              {isRunning ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
              <span className="font-medium text-lg">{isRunning ? "Pausa" : "Iniciar"}</span>
            </button>
            
            <button 
              onClick={skipSession}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md px-6 py-3 rounded-full transition-all border border-white/10 shadow-sm text-white/90"
            >
              <SkipForward size={20} />
              <span className="font-medium">Saltar</span>
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md px-6 py-3 rounded-full transition-all border border-white/10 shadow-sm text-white/90"
            >
              <SquarePen size={20} />
              <span className="font-medium">Editar</span>
            </button>

            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-md w-12 rounded-full transition-all border border-white/10 shadow-sm text-white/90"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>

      {/* Session Selectors (The 3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        <button 
          onClick={() => switchSession("pomodoro")}
          className={`flex items-center justify-between p-6 rounded-xl transition-all backdrop-blur-md border ${
            sessionType === "pomodoro" ? "bg-white/15 border-white/40 shadow-lg scale-[1.02]" : "bg-white/5 border-white/10 opacity-60 hover:opacity-100"
          }`}
        >
          <div className="bg-white/10 p-3 rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target-icon lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-white">Pomodoro</p>
            <p className="text-white/70 text-sm">{settings.pomodoro_duration} min</p>
          </div>
        </button>

        <button 
          onClick={() => switchSession("short_break")}
          className={`flex items-center justify-between p-6 rounded-xl transition-all backdrop-blur-md border ${
            sessionType === "short_break" ? "bg-white/15 border-white/40 shadow-lg scale-[1.02]" : "bg-white/5 border-white/10 opacity-60 hover:opacity-100"
          }`}
        >
          <div className="bg-white/10 p-3 rounded-full text-white">
            <Coffee size={32} />
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-white">Short Break</p>
            <p className="text-white/70 text-sm">{settings.short_break_duration} min</p>
          </div>
        </button>

        <button 
          onClick={() => switchSession("long_break")}
          className={`flex items-center justify-between p-6 rounded-xl transition-all backdrop-blur-md border ${
            sessionType === "long_break" ? "bg-white/15 border-white/40 shadow-lg scale-[1.02]" : "bg-white/5 border-white/10 opacity-60 hover:opacity-100"
          }`}
        >
          <div className="bg-white/10 p-3 rounded-full text-white">
            <Clock size={32} />
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-white">Long Break</p>
            <p className="text-white/70 text-sm">{settings.long_break_duration} min</p>
          </div>
        </button>
      </div>

      {/* Annotations Section */}
      <div className="flex flex-col gap-4 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
        
        {/* Listado de Notas*/}
        <div className="flex flex-wrap items-start gap-3">
          {isLoadingNotes ? (
            <p className="text-white/40 text-sm italic">Cargando...</p>
          ) : (
            notes.map((note) => (
              <div 
                key={note.id} 
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md shadow-sm group transition-all shrink-0 backdrop-blur-sm"
              >
                <div className="grid grid-cols-2 gap-0.5 opacity-40">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-white rounded-full" />
                  ))}
                </div>
                
                <p className="text-sm text-white/90 font-medium">{note.content}</p>
                
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all text-[10px] ml-1"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Área de Input*/}
        <div className="flex items-center gap-2 mt-2 pt-4 border-t border-white/10">
          <input
            type="text"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
            placeholder="Escribe aquí..."
            className="w-40 focus:w-64 transition-all bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 shadow-inner"
          />
          
          <button
            onClick={handleAddNote}
            disabled={!newNoteContent.trim()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 px-4 py-2 rounded-md text-sm text-white/90 border border-white/10 shadow-sm transition-colors"
          >
            <PlusCircle size={16} />
            <span>Añadir anotación</span>
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="mt-6 flex justify-between text-xs uppercase tracking-widest opacity-40 font-bold">
        <span>Enfoque total: {totalFocusTime}m</span>
        <span>Meta: {settings.pomodoro_cycles} ciclos</span>
      </div>

    </div>

      {/* Settings Modal */}
      <PomodoroSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        task={task}
        onSettingsSaved={handleSettingsSaved}
      />

      {/* Completion Modal */}
      {completedAllCycles && (
        <PomodoroCompletionModal
          isOpen={showCompletionModal}
          taskId={task.id}
          taskTitle={task.title}
          totalFocusTime={totalFocusTime}
          currentCycles={settings.pomodoro_cycles}
          onTaskComplete={() => {
          }}
          onAddMoreCycles={(newCycles: number) => {
            
            setCurrentCycle(1)
            setCompletedCycles(0)
            setSessionType("pomodoro")
            setTimeLeft(settings.pomodoro_duration * 60)
            setShowCompletionModal(false)
            setCompletedAllCycles(false)
            sessionStartTimeRef.current = null

            setSettings(prev => ({
              ...prev,
              pomodoro_cycles: newCycles
            }))
          }}
        />
      )}
    </>
  )
}
