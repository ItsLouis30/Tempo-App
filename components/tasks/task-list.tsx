"use client"

import { useRouter } from "next/navigation"

import { TaskNotesModal } from "@/components/tasks/task-notes-modal"

import { useState, useEffect } from "react"
import { Plus, Calendar, ChevronDown, ChevronUp, X, Pencil, Pause, Timer, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { createBrowserClient } from "@supabase/ssr"
import useSWR, { mutate } from "swr"
import { useRadixToast } from "@/components/ui/toast-provider"

interface Tag {
  id: string
  name: string
  color: string | null
  user_id: string
}

interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  start_date: string | null
  status: string
  priority: number
  position: number
  user_id: string
  created_at: string
  tags?: Tag[]
  progress?: number
}

interface TaskListProps {
  userId: string
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const TAG_COLORS = [
  { name: "coral", value: "#F28B82" },
  { name: "mint", value: "#A8E6CF" },
  { name: "yellow", value: "#FFF59D" },
  { name: "lavender", value: "#D7AEFB" },
  { name: "skyblue", value: "#A7C7E7" },
]

async function fetchTasks(userId: string): Promise<Task[]> {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  // Fetch tags for each task
  const tasksWithTags = await Promise.all(
    (tasks || []).map(async (task) => {
      const { data: taskTags } = await supabase
        .from("task_tags")
        .select("tag_id")
        .eq("task_id", task.id)

      if (taskTags && taskTags.length > 0) {
        const tagIds = taskTags.map((tt) => tt.tag_id)
        const { data: tags } = await supabase
          .from("tags")
          .select("*")
          .in("id", tagIds)

        return { ...task, tags: tags || [] }
      }
      return { ...task, tags: [] }
    })
  )

  return tasksWithTags
}

async function fetchUserTags(userId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching tags:", error)
    return []
  }
  return data || []
}

type TabType = "descripcion" | "fecha" | "etiquetas"

export function TaskList({ userId }: TaskListProps) {
  const router = useRouter();
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("descripcion")
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [selectedTaskIdForNotes, setSelectedTaskIdForNotes] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    start_date: "",
    due_date: "",
    priority: 2
  })
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [isSaving, setIsSaving] = useState(false)
  
  // Pomodoro Timer Modal states
  const [selectedTaskIdForPomodoro, setSelectedTaskIdForPomodoro] = useState<string | null>(null)
  const [pomodoroModalOpen, setPomodoroModalOpen] = useState(false)

  // Modal states
  const [showTagModal, setShowTagModal] = useState(false)
  const [showNewTagModal, setShowNewTagModal] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value)
  const [isCreatingTag, setIsCreatingTag] = useState(false)

  // Task expansion and editing states
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    start_date: "",
    due_date: "",
    priority: 2
  })
  const [editSelectedTags, setEditSelectedTags] = useState<Tag[]>([])
  const [editActiveTab, setEditActiveTab] = useState<TabType>("descripcion")
  const [showEditTagModal, setShowEditTagModal] = useState(false)

  const { showToast } = useRadixToast()

  const { data: tasks = [], isLoading } = useSWR(
    `tasks-${userId}`,
    () => fetchTasks(userId)
  )

  const { data: userTags = [] } = useSWR(
    `tags-${userId}`,
    () => fetchUserTags(userId)
  )

  // Set default dates when opening the form (in Peru timezone)
  useEffect(() => {
    if (isAddingTask) {
      const now = new Date()
      // Get current time in Peru timezone for the start date
      const startDate = toDateTimeLocalValue(now.toISOString())
      
      // Due date: 3 days from now at 23:59 in Peru time
      const endDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      // Get the date in Peru timezone and set to 23:59
      const peruFormatter = new Intl.DateTimeFormat("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "America/Lima"
      })
      const datePart = peruFormatter.format(endDate)
      const dueDateStr = `${datePart}T23:59`
      
      setNewTask((prev) => ({
        ...prev,
        start_date: startDate,
        due_date: dueDateStr
      }))
    }
  }, [isAddingTask])

  const handleSaveTask = async () => {
    if (!newTask.title.trim()) return

    setIsSaving(true)
    try {
      const { data: maxPosData } = await supabase
        .from("tasks")
        .select("position")
        .eq("user_id", userId)
        .order("position", { ascending: false })
        .limit(1)

      const newPosition = maxPosData && maxPosData.length > 0 
        ? maxPosData[0].position + 1 
        : 1

      const { data: newTaskData, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: newTask.title.trim(),
          description: newTask.description.trim() || null,
          start_date: newTask.start_date ? toPeruISOString(newTask.start_date) : null,
          due_date: newTask.due_date ? toPeruISOString(newTask.due_date) : null,
          priority: newTask.priority,
          position: newPosition,
          status: "pending",
          progress: 0
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating task:", error)
        showToast("Error ✖", "No se pudo crear la tarea. Inténtalo de nuevo.")
        return
      }

      showToast("Tarea creada ✔", `"${newTaskData.title}" fue agregada correctamente`
        )

      if (selectedTags.length > 0 && newTaskData) {
        const tagRelations = selectedTags.map((tag) => ({
          task_id: newTaskData.id,
          tag_id: tag.id
        }))

        const { error: tagError } = await supabase
          .from("task_tags")
          .insert(tagRelations)

        if (tagError) {
          console.error("Error adding tag relations:", tagError)
        }
      }

      setNewTask({ title: "", description: "", start_date: "", due_date: "", priority: 2 })
      setSelectedTags([])
      setActiveTab("descripcion")
      setIsAddingTask(false)
      mutate(`tasks-${userId}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    setIsCreatingTag(true)
    try {
      const { data, error } = await supabase
        .from("tags")
        .insert({
          user_id: userId,
          name: newTagName.trim(),
          color: newTagColor
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating tag:", error)
        return
      }

      if (data) {
        if (editingTaskId) {
          setEditSelectedTags([...editSelectedTags, data])
        } else {
          setSelectedTags([...selectedTags, data])
        }
        setNewTagName("")
        setNewTagColor(TAG_COLORS[0].value)
        setShowNewTagModal(false)
        mutate(`tags-${userId}`)
      }
    } finally {
      setIsCreatingTag(false)
    }
  }

  const handleSelectTagFromModal = (tag: Tag) => {
    if (editingTaskId) {
      if (!editSelectedTags.find((t) => t.id === tag.id)) {
        setEditSelectedTags([...editSelectedTags, tag])
      }
      setShowEditTagModal(false)
    } else {
      if (!selectedTags.find((t) => t.id === tag.id)) {
        setSelectedTags([...selectedTags, tag])
      }
      setShowTagModal(false)
    }
    setTagSearchQuery("")
  }

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId))
  }

  const handleRemoveEditTag = (tagId: string) => {
    setEditSelectedTags(editSelectedTags.filter((t) => t.id !== tagId))
  }

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "pending" : "done"
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, progress: newStatus === "done" ? 100 : 0 })
      .eq("id", taskId)

    if (error) {
      console.error("Error updating task:", error)
      return
    }
    mutate(`tasks-${userId}`)
  }

  const handleCancel = () => {
    setNewTask({ title: "", description: "", start_date: "", due_date: "", priority: 2 })
    setSelectedTags([])
    setActiveTab("descripcion")
    setIsAddingTask(false)
  }

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id)
    setEditTask({
      title: task.title,
      description: task.description || "",
      start_date: toDateTimeLocalValue(task.start_date),
      due_date: toDateTimeLocalValue(task.due_date),
      priority: task.priority
    })
    setEditSelectedTags(task.tags || [])
    setEditActiveTab("descripcion")
    setExpandedTaskId(task.id)
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditTask({ title: "", description: "", start_date: "", due_date: "", priority: 2 })
    setEditSelectedTags([])
    setEditActiveTab("descripcion")
  }

  const handleSaveEdit = async () => {
    if (!editingTaskId || !editTask.title.trim()) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: editTask.title.trim(),
          description: editTask.description.trim() || null,
          start_date: editTask.start_date ? toPeruISOString(editTask.start_date) : null,
          due_date: editTask.due_date ? toPeruISOString(editTask.due_date) : null,
          priority: editTask.priority
        })
        .eq("id", editingTaskId)

      if (error) {
        console.error("Error updating task:", error)
        return
      }

      // Update tag relations - first delete existing
      await supabase
        .from("task_tags")
        .delete()
        .eq("task_id", editingTaskId)

      // Then add new tags
      if (editSelectedTags.length > 0) {
        const tagRelations = editSelectedTags.map((tag) => ({
          task_id: editingTaskId,
          tag_id: tag.id
        }))

        await supabase
          .from("task_tags")
          .insert(tagRelations)
      }

      handleCancelEdit()
      mutate(`tasks-${userId}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)

    if (error) {
      console.error("Error deleting task:", error)
      showToast("Error ✖", "No se pudo eliminar la tarea.")
      return
    }

    showToast("Tarea eliminada.", "La tarea fue eliminada correctamente.")
    mutate(`tasks-${userId}`)
  }

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  const filteredTags = userTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  )

  // Helper to format date for display in Peru timezone
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Lima"
    }
    return date.toLocaleString("es-PE", options)
  }

  // Helper to convert datetime-local value to ISO string preserving Peru timezone
  const toPeruISOString = (localDateTimeValue: string): string => {
    if (!localDateTimeValue) return ""
    // The datetime-local input gives us a value like "2024-01-15T14:30"
    // We interpret this as Peru time (UTC-5) by explicitly adding the offset
    // This tells JavaScript that this time is in UTC-5
    const dateWithPeruOffset = new Date(`${localDateTimeValue}:00-05:00`)
    return dateWithPeruOffset.toISOString()
  }

  // Helper to convert ISO string from DB to datetime-local format in Peru timezone
  const toDateTimeLocalValue = (isoString: string | null): string => {
    if (!isoString) return ""
    const date = new Date(isoString)
    // Format as datetime-local expects: YYYY-MM-DDTHH:MM in Peru timezone
    const peruFormatter = new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Lima"
    })
    const parts = peruFormatter.formatToParts(date)
    const year = parts.find(p => p.type === "year")?.value
    const month = parts.find(p => p.type === "month")?.value
    const day = parts.find(p => p.type === "day")?.value
    const hour = parts.find(p => p.type === "hour")?.value
    const minute = parts.find(p => p.type === "minute")?.value
    return `${year}-${month}-${day}T${hour}:${minute}`
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Alta"
      case 2: return "Media"
      case 3: return "Baja"
      default: return "Media"
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "text-red-500"
      case 2:
        return "text-yellow-400"
      case 3:
        return "text-green-500"
      default:
        return "text-yellow-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Task Button */}
      <button
        type="button"
        onClick={() => setIsAddingTask(true)}
        className="group flex items-center gap-4 px-6 py-4 glass-card shadow-xl"
      >
        <div className="w-10 h-10 rounded-full bg-[#FCEE8E] flex items-center justify-center group-hover:scale-105 transition-transform">
          <Plus className="w-5 h-5 text-black" />
        </div>
        <span className="text-lg text-white/80 group-hover:text-white transition-colors font-medium">
          Agregar tarea
        </span>
      </button>

      {/* Tasks Section */}
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">
          TUS TAREAS
        </h2>

        {/* New Task Form */}
        {isAddingTask && (
          <div className="glass-panel p-5 space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox
                    className="h-5 w-5 rounded border-2 border-white/20"
                    disabled
                  />
                  <Input
                    placeholder="NUEVA TAREA"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="bg-transparent border-none text-xl font-bold text-white placeholder:text-white/30 focus-visible:ring-0 p-0 h-auto flex-1"
                  />
                </div>

                {/* Tab Content */}
                {activeTab === "descripcion" && (
                  <div className="space-y-2">
                    <p className="text-sm text-white/70">Descripción</p>
                    <textarea
                      placeholder="Escribe una descripción detallada de la tarea..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 min-h-[100px] resize-none"
                    />
                  </div>
                )}

                {activeTab === "fecha" && (
                  <div className="flex flex-wrap gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-white/70">Fecha de inicio:</p>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-3 py-2">
                        <input
                          type="datetime-local"
                          value={newTask.start_date}
                          onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                          className="bg-transparent border-none text-sm text-white focus:outline-none [color-scheme:dark][&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-white/70">Fecha límite:</p>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-3 py-2">
                        <input
                          type="datetime-local"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                          className="bg-transparent border-none text-sm text-white focus:outline-none [color-scheme:dark][&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-white/70">Prioridad:</p>
                      <div className="relative">
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: Number(e.target.value) })}
                          className="appearance-none bg-white/5 border border-white/10 rounded px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer [&>option]:bg-black [&>option]:text-white"
                        >
                          <option value={1}>Alta</option>
                          <option value={2}>Media</option>
                          <option value={3}>Baja</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "etiquetas" && (
                  <div className="space-y-3">
                    <p className="text-sm text-white/70">Etiquetas</p>
                    
                    {/* Selected Tags Display */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-sm px-3 py-1 rounded-full flex items-center gap-2 text-black font-medium"
                            style={{ backgroundColor: tag.color || "#4A4A4A" }}
                          >
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag.id)}
                              className="hover:opacity-70"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add Tag Button */}
                    <button
                      type="button"
                      onClick={() => setShowTagModal(true)}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 text-sm text-white px-3 py-1.5 rounded transition-colors"
                    >
                      + Añadir
                    </button>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex flex-col gap-1 min-w-[130px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("descripcion")}
                  className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeTab === "descripcion"
                      ? "bg-white/20 text-white font-medium"
                      : "bg-transparent text-white/50 hover:bg-white/10"
                  }`}
                >
                  Descripción
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("fecha")}
                  className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeTab === "fecha"
                      ? "bg-white/20 text-white font-medium"
                      : "bg-transparent text-white/50 hover:bg-white/10"
                  }`}
                >
                  Fecha
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("etiquetas")}
                  className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeTab === "etiquetas"
                      ? "bg-white/20 text-white font-medium"
                      : "bg-transparent text-white/50 hover:bg-white/10"
                  }`}
                >
                  Etiquetas
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveTask}
                disabled={!newTask.title.trim() || isSaving}
                className="bg-[#FCEE8E] hover:bg-[#FCEE8E]/90 text-black font-medium border-none"
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        )}

        {/* Tasks List or Empty State */}
        {isLoading ? (
          <div className="glass-panel p-8 text-center">
            <p className="text-white/70">Cargando tareas...</p>
          </div>
        ) : tasks.length === 0 && !isAddingTask ? (
          <div className="glass-panel p-8 text-center">
            <p className="text-white/70 drop-shadow-md">
              Aún no tienes tareas. Empieza creando la primera y da el primer paso.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start mt-6">
            {[
              { id: "pending", title: "Pendientes", dot: "bg-blue-400", items: tasks.filter(t => t.status !== "done") },
              { id: "done", title: "Completadas", dot: "bg-green-400", items: tasks.filter(t => t.status === "done") }
            ].map(col => (
              <div key={col.id} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/90 bg-white/10 px-4 py-2 rounded-full inline-flex items-center gap-2 backdrop-blur-sm border border-white/5 shadow-sm">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                    {col.title}
                  </h3>
                  <span className="text-xs text-white/70 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">{col.items.length}</span>
                </div>
                
                <div className="space-y-4">
                  {col.items.map((task) => (
                    <div key={task.id} className="glass-card flex flex-col p-5 group shadow-lg">
                      {/* Task Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <Checkbox
                          checked={task.status === "done"}
                          onCheckedChange={() => handleToggleComplete(task.id, task.status)}
                          className="h-5 w-5 rounded border-2 border-white/20 data-[state=checked]:bg-[#FCEE8E] data-[state=checked]:border-[#FCEE8E] data-[state=checked]:text-black mt-0.5"
                        />
                        <div className="flex-1">
                          <h3 className={`font-semibold leading-snug transition-colors ${task.status === "done" ? "line-through text-white/40" : "text-white/90"}`}>
                            {task.title}
                          </h3>
                        </div>
                      </div>

                      {/* Task Meta (Date, Tags) */}
                      <div className="pl-8 space-y-2 mb-4">
                        {(task.due_date || task.start_date) && (
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <Calendar className="w-3.5 h-3.5" />
                            {task.due_date ? formatDate(task.due_date) : formatDate(task.start_date)}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            task.priority === 1
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : task.priority === 2
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                              : "bg-green-500/20 text-green-300 border border-green-500/30"
                          }`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          
                          {task.tags && task.tags.map(tag => (
                            <span
                              key={tag.id}
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium text-black"
                              style={{ backgroundColor: tag.color || "#FFF59D" }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Task Toolbar */}
                      <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between pl-8 gap-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(task)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            title="Editar tarea"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/pomodoro/${task.id}`)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            title="Pomodoro"
                          >
                            <Timer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTaskIdForNotes(task.id)
                              setNotesModalOpen(true)
                            }}
                            className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            title="Notas"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/cronometro/${task.id}`)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            title="Cronómetro"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                          title="Eliminar tarea"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>

                      {/* Inline Edit Form Overlay */}
                      {editingTaskId === task.id && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl rounded-2xl p-5 z-10 flex flex-col overflow-y-auto custom-scrollbar">
                           <div className="flex justify-between items-center mb-4">
                             <h4 className="font-semibold text-white">Editar Tarea</h4>
                             <button onClick={handleCancelEdit} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
                           </div>
                           
                           <Input
                             value={editTask.title}
                             onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                             className="bg-white/5 border-white/10 text-white font-medium mb-3 focus-visible:ring-1 focus-visible:ring-white/30"
                             placeholder="Título de la tarea"
                           />
                           
                           <div className="space-y-4 mb-4 flex-1">
                             <div>
                               <p className="text-xs text-white/50 mb-1">Descripción</p>
                               <textarea
                                 value={editTask.description}
                                 onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                                 className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 min-h-[80px] resize-none"
                               />
                             </div>
                             
                             <div className="grid grid-cols-2 gap-3">
                               <div>
                                 <p className="text-xs text-white/50 mb-1">Inicio</p>
                                 <input
                                   type="datetime-local"
                                   value={editTask.start_date}
                                   onChange={(e) => setEditTask({ ...editTask, start_date: e.target.value })}
                                   className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:outline-none [color-scheme:dark]"
                                 />
                               </div>
                               <div>
                                 <p className="text-xs text-white/50 mb-1">Límite</p>
                                 <input
                                   type="datetime-local"
                                   value={editTask.due_date}
                                   onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                                   className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:outline-none [color-scheme:dark]"
                                 />
                               </div>
                             </div>

                             <div>
                                <p className="text-xs text-white/50 mb-1">Prioridad</p>
                                <select
                                  value={editTask.priority}
                                  onChange={(e) => setEditTask({ ...editTask, priority: Number(e.target.value) })}
                                  className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 [&>option]:bg-black"
                                >
                                  <option value={1}>Alta</option>
                                  <option value={2}>Media</option>
                                  <option value={3}>Baja</option>
                                </select>
                             </div>
                             
                             <div>
                                <p className="text-xs text-white/50 mb-1">Etiquetas</p>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {editSelectedTags.map((tag) => (
                                    <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 text-black font-medium" style={{ backgroundColor: tag.color || "#FFF59D" }}>
                                      {tag.name}
                                      <button type="button" onClick={() => handleRemoveEditTag(tag.id)}><X className="w-3 h-3" /></button>
                                    </span>
                                  ))}
                                </div>
                                <button type="button" onClick={() => setShowEditTagModal(true)} className="bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-white px-3 py-1.5 rounded transition-colors">
                                  + Añadir etiqueta
                                </button>
                             </div>
                           </div>

                           <div className="mt-auto flex gap-2">
                             <Button onClick={handleSaveEdit} disabled={!editTask.title.trim() || isSaving} className="flex-1 bg-[#FCEE8E] hover:bg-[#FCEE8E]/90 text-black font-medium">
                               {isSaving ? "Guardando..." : "Guardar Cambios"}
                             </Button>
                           </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tag Selection Modal */}
      {(showTagModal || showEditTagModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-5 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-white drop-shadow-md">Etiqueta</h3>
            
            <Input
              placeholder="Buscar etiqueta"
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/30"
            />

            {/* Tags List */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleSelectTagFromModal(tag)}
                  className="w-full text-left px-4 py-2 rounded-lg drop-shadow-sm text-black font-medium transition-opacity hover:opacity-80"
                  style={{ backgroundColor: tag.color || "#4A4A4A" }}
                >
                  {tag.name}
                </button>
              ))}
            </div>

            {/* New Tag Button */}
            <button
              type="button"
              onClick={() => setShowNewTagModal(true)}
              className="text-white hover:text-white/80 transition-colors text-sm font-medium"
            >
              + Nueva etiqueta
            </button>

            {/* Close button */}
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowTagModal(false)
                  setShowEditTagModal(false)
                  setTagSearchQuery("")
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Tag Modal */}
      {showNewTagModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="glass-panel p-5 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Nueva etiqueta</h3>
            
            <div className="space-y-2">
              <p className="text-xs text-white/60">Nombre</p>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="bg-white/5 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-white/30"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-white/60">Selecciona un color</p>
              <div className="flex gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setNewTagColor(color.value)}
                    className={`w-12 h-8 rounded-lg transition-all ${
                      newTagColor === color.value ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowNewTagModal(false)
                  setNewTagName("")
                  setNewTagColor(TAG_COLORS[0].value)
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || isCreatingTag}
                className="bg-[#FCEE8E] hover:bg-[#FCEE8E]/90 text-black font-medium border-none"
              >
                {isCreatingTag ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedTaskIdForNotes && (
        <TaskNotesModal
          taskId={selectedTaskIdForNotes}
          userId={userId}
          isOpen={notesModalOpen}
          onClose={() => {
            setNotesModalOpen(false)
            setSelectedTaskIdForNotes(null)
          }}
        />
      )}
    </div>
  )
}
