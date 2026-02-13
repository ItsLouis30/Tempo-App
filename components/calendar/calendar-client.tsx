"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import "@/components/calendar/calendar-custom.css"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Plus, Bell, Calendar, Trash} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Task {
  id: string
  title: string
  due_date: string
  priority: number
  status: string
  description: string
}

interface Reminder {
  id: string
  task_id: string
  user_id: string
  remind_at: string
  message: string
  sent: boolean
}

export default function CalendarClient({ tasks }: { tasks: Task[] }) {
  const supabase = createClient()

  const [showReminderForm, setShowReminderForm] = useState(false)
  const [remindAt, setRemindAt] = useState("")
  const [message, setMessage] = useState("")
  const [loadingReminder, setLoadingReminder] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.due_date,
    allDay: false,
    extendedProps: task,                        
    borderColor: 
      task.priority === 1 ? "#ef4444" : 
      task.priority === 2 ? "#facc15" : 
      "#22c55e",
    textColor: "#1f2937"
  }))

  const renderEventContent = (eventInfo: any) => {
  const isReminder = eventInfo.event.extendedProps?.type === "reminder"
  const hasReminder =
    !isReminder && taskHasReminder(eventInfo.event.id)

  return (
    <div className="flex flex-col px-1 overflow-hidden">
      <div className="flex items-center gap-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: eventInfo.borderColor }}
        />
        <b className="truncate text-xs">{eventInfo.timeText}</b>
      </div>

      <i className="truncate text-xs not-italic font-medium flex items-center gap-1">
        {eventInfo.event.title}

        {(isReminder || hasReminder) && (
          <Bell
            className={"w-3 h-3 shrink-0 text-gray-900"}
          />
        )}
      </i>
    </div>
  )
}

  function toDatetimeLocal(dateString: string) {
    const date = new Date(dateString)

    const pad = (n: number) => n.toString().padStart(2, "0")

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  async function saveReminder() {
    if (!remindAt) return

    setLoadingReminder(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoadingReminder(false)
      return
    }

    const { error } = await supabase.from("reminders").insert({
      task_id: selectedTask?.id ?? null,
      user_id: user.id,
      remind_at: new Date(remindAt).toISOString(),
      message,
    })

    setLoadingReminder(false)

    if (!error) {
      setShowReminderForm(false)
      setRemindAt("")
      setMessage("")

      const { data } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)

    if (data) setReminders(data)
    }
  }

  useEffect(() => {
    setSelectedTask(null)
    setSelectedReminder(null)
    setShowReminderForm(false)
    setMessage("")
    setRemindAt("")
  }, [])
  
  useEffect(() => {
  async function loadReminders() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)

    if (!error && data) {
      setReminders(data)
    }
  }

  loadReminders()
}, [])

  const reminderEvents = reminders
  .filter((r) => !r.task_id)
  .map((reminder) => ({
      id: `reminder-${reminder.id}`,
      title: reminder.message || "Recordatorio",
      start: reminder.remind_at,
      borderColor: "#3b82f6",
      textColor: "#1e3a8a",
      extendedProps: {
        type: "reminder",
        reminder,
      },
  }))

  function taskHasReminder(taskId: string) {
    return reminders.some((r) => r.task_id === taskId)
  }

  return (
    <div className="grid grid-cols-[1fr_420px] gap-6 max-w-[1600px] mx-auto p-4">
        <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-xl transition-all hover:shadow-2xl">
            <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            nextDayThreshold="01:00:00"
            locale={esLocale}
            firstDay={1}
            events={[...events, ...reminderEvents]}
            height="auto"
            aspectRatio={1.35}
            expandRows={true}
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
            }}
            titleFormat={{ year: 'numeric', month: 'long' }}
            eventContent={renderEventContent}
            eventClick={(info) => {
              const isReminder = info.event.extendedProps?.type === "reminder"

              if (isReminder) {
                setSelectedTask(null)
                setSelectedReminder(info.event.extendedProps.reminder)
                return
              }

              setSelectedReminder(null)
              setSelectedTask(info.event.extendedProps as Task)
            }}

            dayMaxEvents={3}
            buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana'
            }}/>
        </div>   

        <div className="bg-card border rounded-xl shadow-xl h-full flex flex-col overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground drop-shadow-sm">
                Recordatorios
              </h3>

              <button
                onClick={() => {
                  setSelectedTask(null)
                  setSelectedReminder(null)
                  setMessage("")
                  setRemindAt("")
                  setShowReminderForm(true)}}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                Nuevo
              </button>
            </div>

            {showReminderForm && (
              <div className="rounded-lg border p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Fecha y hora
                  </label>
                  <input
                    type="datetime-local"
                    value={remindAt}
                    onChange={(e) => setRemindAt(e.target.value)}
                    className="w-full rounded-md border px-2 py-1.5 text-sm bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Mensaje (opcional)
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Recordatorio"
                    className="w-full rounded-md border px-2 py-1.5 text-sm bg-background"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowReminderForm(false)}
                    className="text-sm px-3 py-1.5 rounded-md hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveReminder}
                    disabled={loadingReminder || !remindAt}
                    className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>


          <div className="flex-1 p-6 overflow-auto">

            {/* SIN SELECCIONAR */}
            {!selectedTask && !selectedReminder && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shadow-md">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-sm drop-shadow-lg">
                    No hay nada seleccionado
                  </p>
                  <p className="text-xs mt-1 drop-shadow-lg">
                    Haz clic en una tarea o recordatorio
                  </p>
                </div>
              </div>
            )}

            {/* TAREA */}
            {selectedTask && (
              <div className="relative animate-in fade-in slide-in-from-right-2 space-y-4">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="absolute top-0 right-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold">
                  {selectedTask.title}
                </h2>

                <p className="text-sm text-muted-foreground drop-shadow-lg">
                  {selectedTask.description || "Sin descripción"}
                </p>

                <div className="space-y-2 text-[15px] drop-shadow-lg">
                  <p><b>Fecha límite:</b> {new Date(selectedTask.due_date).toLocaleDateString("es-ES")}</p>
                  <p><b>Prioridad:</b> {selectedTask.priority === 1 ? "Alta" : selectedTask.priority === 2 ? "Media" : "Baja"}</p>
                  <p><b>Estado:</b> {
                    selectedTask.status === "pending"
                      ? "Pendiente"
                      : selectedTask.status === "completed"
                      ? "Completado"
                      : selectedTask.status
                  }</p>
                </div>

                <button
                  disabled={taskHasReminder(selectedTask.id)}
                  onClick={() => {
                    setRemindAt(toDatetimeLocal(selectedTask.due_date))
                    setMessage(`Recordatorio de "${selectedTask.title}"`)
                    setShowReminderForm(true)
                  }}
                  className="mt-4 flex items-center gap-2 text-sm px-3 py-2 rounded-md border hover:bg-muted disabled:opacity-50 shadow-md"
                >
                  <Bell className="w-4 h-4" />
                  Agregar recordatorio
                </button>
              </div>
            )}

            {/* RECORDATORIO */}
            {selectedReminder && (
              <div className="relative animate-in fade-in slide-in-from-right-2 space-y-4">
                <button
                  onClick={() => setSelectedReminder(null)}
                  className="absolute top-0 right-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  Recordatorio
                </h2>

                <p className="text-sm text-muted-foreground drop-shadow-lg">
                  {selectedReminder.message || "Sin mensaje"}
                </p>

                <div className="space-y-2 text-[15px] drop-shadow-lg">
                  <p><b>Fecha:</b> {new Date(selectedReminder.remind_at).toLocaleDateString("es-ES")}</p>
                  <p><b>Hora:</b> {new Date(selectedReminder.remind_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>
                  <p><b>Estado:</b> {selectedReminder.sent ? "Completado" : "Pendiente"}</p>
                </div>

                <button
                  onClick={async () => {
                    await supabase.from("reminders").delete().eq("id", selectedReminder.id)
                    setReminders((prev) => prev.filter((r) => r.id !== selectedReminder.id))
                    setSelectedReminder(null)
                  }}
                  className="mt-4 flex items-center shadow-md gap-2 text-sm px-3 py-2 rounded-md border hover:bg-muted"
                >
                  <Trash className="w-4 h-4" />
                  Eliminar recordatorio
                </button>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}