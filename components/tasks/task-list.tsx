"use client"

import { useRouter } from "next/navigation"

import { TaskNotesModal } from "@/components/tasks/task-notes-modal"
import { ProductivityWidget } from "@/components/tasks/productivity-widget"

import { useState, useEffect } from "react"
import { Plus, Calendar, ChevronDown, ChevronUp, X, Pencil, Pause, Timer, FileText, Clock, Search, Filter, LayoutGrid, List } from "lucide-react"
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
  greeting: string
  firstName: string
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

export function TaskList({ userId, greeting, firstName }: TaskListProps) {
  const router = useRouter();
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("descripcion")
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [selectedTaskIdForNotes, setSelectedTaskIdForNotes] = useState<string | null>(null)

  // New state for toolbar
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterPriority, setFilterPriority] = useState<number | null>(null)
  const [filterDate, setFilterDate] = useState<string | null>(null)
  const [filterTags, setFilterTags] = useState<string[]>([])
  
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

  const processedTasks = tasks.filter(task => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc) return false;
    }
    
    // 2. Priority
    if (filterPriority !== null && task.priority !== filterPriority) {
      return false;
    }
    
    // 3. Tags
    if (filterTags.length > 0) {
      if (!task.tags || task.tags.length === 0) return false;
      const taskTagIds = task.tags.map(t => t.id);
      const hasAllTags = filterTags.every(id => taskTagIds.includes(id));
      if (!hasAllTags) return false;
    }
    
    // 4. Date
    if (filterDate) {
      const now = new Date();
      now.setHours(0,0,0,0);
      
      const due = task.due_date ? new Date(task.due_date) : null;
      if (due) due.setHours(0,0,0,0);
      
      if (filterDate === 'overdue') {
        if (!due || due >= now || task.status === 'done') return false;
      } else if (filterDate === 'today') {
        if (!due || due.getTime() !== now.getTime()) return false;
      } else if (filterDate === 'upcoming') {
        if (!due || due <= now) return false;
      }
    }
    
    return true;
  });

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
    <div className="space-y-8">
      {/* Header Row: Greeting and Add Task */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white drop-shadow-md">{greeting}, {firstName}</h1>
          <p className="text-white/70 md:text-xl font-medium">Hoy es un buen día para avanzar. ¿Qué tienes planeado?</p>
        </div>
        
        {/* Add Task Button */}
        <button
          type="button"
          onClick={() => {
            setEditingTaskId(null);
            setIsAddingTask(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Agregar tarea
        </button>
      </div>

      {/* Toolbar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search & Filter */}
        <div className="flex flex-1 max-w-md items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full text-sm transition-all shadow-sm ${isFilterOpen || filterPriority !== null || filterDate !== null || filterTags.length > 0 ? 'bg-white text-black' : 'bg-white/[0.04] hover:bg-white/[0.08] text-white'}`}
            >
              <Filter className={`w-4 h-4 ${isFilterOpen || filterPriority !== null || filterDate !== null || filterTags.length > 0 ? 'text-black' : 'text-white/70'}`} />
              Filtrar {(filterPriority !== null || filterDate !== null || filterTags.length > 0) && "•"}
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Filtros</h3>
                  <button onClick={() => {
                    setFilterPriority(null)
                    setFilterDate(null)
                    setFilterTags([])
                  }} className="text-xs text-white/50 hover:text-white">
                    Limpiar
                  </button>
                </div>
                
                {/* Priority */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Prioridad</label>
                  <div className="flex gap-2">
                    {[
                      { val: 1, label: 'Alta', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
                      { val: 2, label: 'Media', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
                      { val: 3, label: 'Baja', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
                    ].map(p => (
                      <button
                        key={p.val}
                        onClick={() => setFilterPriority(filterPriority === p.val ? null : p.val)}
                        className={`flex-1 py-1.5 text-xs rounded-full border transition-all ${filterPriority === p.val ? p.color : 'border-white/10 text-white/70 hover:bg-white/5'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Fecha</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'overdue', label: 'Vencidas' },
                      { val: 'today', label: 'Hoy' },
                      { val: 'upcoming', label: 'Próximas' }
                    ].map(d => (
                      <button
                        key={d.val}
                        onClick={() => setFilterDate(filterDate === d.val ? null : d.val)}
                        className={`py-1.5 text-xs rounded-md border transition-all ${filterDate === d.val ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-white/70 hover:bg-white/5'}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {userTags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Etiquetas</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                      {userTags.map((tag: Tag) => {
                        const isSelected = filterTags.includes(tag.id)
                        return (
                          <button
                            key={tag.id}
                            onClick={() => setFilterTags(prev => isSelected ? prev.filter(id => id !== tag.id) : [...prev, tag.id])}
                            className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1.5 ${isSelected ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-white/70 hover:bg-white/5'}`}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || '#888' }} />
                            {tag.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: View Selector */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              viewMode === "kanban" 
                ? "bg-white text-black shadow-sm" 
                : "text-white/70 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              viewMode === "list" 
                ? "bg-white text-black shadow-sm" 
                : "text-white/70 hover:text-white"
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white/50 tracking-widest uppercase">
          TUS TAREAS
        </h2>

        {/* Unified Task Form (Add/Edit) */}
        {(isAddingTask || editingTaskId !== null) && (
          <div className="glass-panel p-5 space-y-4 shadow-xl mb-6">
            {(() => {
              const isEdit = editingTaskId !== null;
              const currentTask = isEdit ? editTask : newTask;
              const setCurrentTask = isEdit ? setEditTask : setNewTask;
              const activeTabState = isEdit ? editActiveTab : activeTab;
              const setActiveTabState = isEdit ? setEditActiveTab : setActiveTab;
              const currentSelectedTags = isEdit ? editSelectedTags : selectedTags;
              const handleRemove = isEdit ? handleRemoveEditTag : handleRemoveTag;
              const handleSave = isEdit ? handleSaveEdit : handleSaveTask;
              const handleCancelForm = isEdit ? handleCancelEdit : handleCancel;
              const setShowTag = isEdit ? setShowEditTagModal : setShowTagModal;
              const formTitle = isEdit ? "EDITAR TAREA" : "NUEVA TAREA";

              return (
                <>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Checkbox
                          className="h-5 w-5 rounded border-2 border-white/20"
                          disabled
                        />
                        <Input
                          placeholder={formTitle}
                          value={currentTask.title}
                          onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                          className="bg-transparent border-none text-xl font-bold text-white placeholder:text-white/30 focus-visible:ring-0 p-0 h-auto flex-1"
                        />
                      </div>

                      {/* Tab Content */}
                      {activeTabState === "descripcion" && (
                        <div className="space-y-2">
                          <p className="text-sm text-white/70">Descripción</p>
                          <textarea
                            placeholder="Escribe una descripción detallada de la tarea..."
                            value={currentTask.description}
                            onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 min-h-[100px] resize-none"
                          />
                        </div>
                      )}

                      {activeTabState === "fecha" && (
                        <div className="flex flex-wrap gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-white/70">Fecha de inicio:</p>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-3 py-2">
                              <input
                                type="datetime-local"
                                value={currentTask.start_date}
                                onChange={(e) => setCurrentTask({ ...currentTask, start_date: e.target.value })}
                                className="bg-transparent border-none text-sm text-white focus:outline-none [color-scheme:dark][&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-white/70">Fecha límite:</p>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-3 py-2">
                              <input
                                type="datetime-local"
                                value={currentTask.due_date}
                                onChange={(e) => setCurrentTask({ ...currentTask, due_date: e.target.value })}
                                className="bg-transparent border-none text-sm text-white focus:outline-none [color-scheme:dark][&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-white/70">Prioridad:</p>
                            <div className="relative">
                              <select
                                value={currentTask.priority}
                                onChange={(e) => setCurrentTask({ ...currentTask, priority: Number(e.target.value) })}
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

                      {activeTabState === "etiquetas" && (
                        <div className="space-y-3">
                          <p className="text-sm text-white/70">Etiquetas</p>
                          
                          {/* Selected Tags Display */}
                          {currentSelectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {currentSelectedTags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="text-sm px-3 py-1 rounded-full flex items-center gap-2 text-black font-medium"
                                  style={{ backgroundColor: tag.color || "#4A4A4A" }}
                                >
                                  {tag.name}
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(tag.id)}
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
                            onClick={() => setShowTag(true)}
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
                        onClick={() => setActiveTabState("descripcion")}
                        className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                          activeTabState === "descripcion"
                            ? "bg-white/20 text-white font-medium"
                            : "bg-transparent text-white/50 hover:bg-white/10"
                        }`}
                      >
                        Descripción
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTabState("fecha")}
                        className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                          activeTabState === "fecha"
                            ? "bg-white/20 text-white font-medium"
                            : "bg-transparent text-white/50 hover:bg-white/10"
                        }`}
                      >
                        Fecha
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTabState("etiquetas")}
                        className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                          activeTabState === "etiquetas"
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
                      onClick={handleCancelForm}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!currentTask.title.trim() || isSaving}
                      className="bg-[#FCEE8E] hover:bg-[#FCEE8E]/90 text-black font-medium border-none"
                    >
                      {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </>
              );
            })()}
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
        ) : processedTasks.length === 0 ? (
          <div className="glass-panel p-8 text-center">
            <p className="text-white/70 drop-shadow-md">
              No se encontraron tareas que coincidan con los filtros.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="flex flex-col gap-2 mt-6">
            {processedTasks.map(task => (
              <div key={task.id} className="glass-card flex items-center justify-between p-4 group shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={() => handleToggleComplete(task.id, task.status)}
                    className="h-5 w-5 rounded border-2 border-white/20 data-[state=checked]:bg-[#FCEE8E] data-[state=checked]:border-[#FCEE8E] data-[state=checked]:text-black"
                  />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <h3 className={`font-medium ${task.status === "done" ? "line-through text-white/40" : "text-white/90"}`}>
                      {task.title}
                    </h3>
                    
                    <div className="flex items-center gap-3">
                      {task.priority && (
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                          task.priority === 1 ? "bg-red-500/20 text-red-400 border-red-500/30" : 
                          task.priority === 2 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : 
                          "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}>
                          {task.priority === 1 ? "Alta" : task.priority === 2 ? "Media" : "Baja"}
                        </span>
                      )}
                      
                      {task.due_date && (
                        <span className="text-xs text-white/50 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {task.tags.map(t => (
                            <span key={t.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color || '#888' }} title={t.name} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleStartEdit(task)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                     <Pencil className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-white/50 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start mt-6">
            {[
              { id: "pending", title: "Pendientes", dot: "bg-blue-400", items: processedTasks.filter(t => t.status !== "done") },
              { id: "done", title: "Completadas", dot: "bg-green-400", items: processedTasks.filter(t => t.status === "done") }
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



                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Productivity Widget as 3rd Column */}
            <div className="hidden lg:block space-y-4 h-full">
              <ProductivityWidget tasks={processedTasks} />
            </div>
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
