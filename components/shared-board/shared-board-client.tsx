"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronDown, ChevronUp, LayoutGrid, List } from "lucide-react"

interface SharedBoardClientProps {
  profile: any
  tasks: any[]
  tags: any[]
  taskTags: any[]
}

export function SharedBoardClient({ profile, tasks, tags, taskTags }: SharedBoardClientProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Inject tags into tasks
  const processedTasks = tasks.map(task => {
    const taskTagIds = taskTags.filter(tt => tt.task_id === task.id).map(tt => tt.tag_id)
    const taskTagsData = tags.filter(t => taskTagIds.includes(t.id))
    return { ...task, tags: taskTagsData }
  })

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

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

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Alta"
      case 2: return "Media"
      case 3: return "Baja"
      default: return "Media"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-white/50 tracking-widest uppercase">
          TAREAS
        </h2>

        {/* View Selector */}
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

      {processedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <p>Este tablero no tiene tareas aún.</p>
        </div>
      ) : (
        <>
          {viewMode === "kanban" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {processedTasks.map((task) => (
                <div key={task.id} className="glass-card p-5 space-y-4 shadow-lg flex flex-col h-full group hover:shadow-xl transition-all">
                  {/* Status Indicator */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 border-white/20 flex items-center justify-center ${task.status === 'done' ? 'bg-[#A8E6CF]/20 border-[#A8E6CF]' : 'opacity-50'}`}>
                        {task.status === 'done' && <div className="w-3 h-3 bg-[#A8E6CF] rounded-[1px]" />}
                      </div>
                      <h3 className={`font-semibold text-white/90 leading-tight ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </h3>
                    </div>
                  </div>

                  {/* Expand button */}
                  {task.description && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(task.id)}
                      className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors w-fit"
                    >
                      {expandedTaskId === task.id ? (
                        <><ChevronUp className="w-3 h-3" /> Ocultar descripción</>
                      ) : (
                        <><ChevronDown className="w-3 h-3" /> Ver descripción</>
                      )}
                    </button>
                  )}

                  {/* Expanded Content */}
                  {expandedTaskId === task.id && task.description && (
                    <p className="text-sm text-white/70 whitespace-pre-wrap bg-white/5 p-3 rounded-lg border border-white/10">
                      {task.description}
                    </p>
                  )}

                  {/* Footer Stats */}
                  <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-white/10">
                    {(task.start_date || task.due_date) && (
                      <div className="flex items-center gap-1.5 text-xs text-white/40">
                        <Calendar className="w-3.5 h-3.5" />
                        {mounted ? (task.due_date ? formatDate(task.due_date) : formatDate(task.start_date)) : "..."}
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
                      
                      {task.tags && task.tags.map((tag: any) => (
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
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {processedTasks.map((task) => (
                <div key={task.id} className="glass-card p-4 shadow-sm flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-5 h-5 rounded border-2 border-white/20 flex items-center justify-center shrink-0 ${task.status === 'done' ? 'bg-[#A8E6CF]/20 border-[#A8E6CF]' : 'opacity-50'}`}>
                      {task.status === 'done' && <div className="w-3 h-3 bg-[#A8E6CF] rounded-[1px]" />}
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold text-white/90 truncate ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          task.priority === 1
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : task.priority === 2
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-green-500/20 text-green-300 border border-green-500/30"
                        }`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="flex gap-2">
                      {task.tags && task.tags.slice(0, 3).map((tag: any) => (
                        <span
                          key={tag.id}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium text-black"
                          style={{ backgroundColor: tag.color || "#FFF59D" }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>

                    {(task.start_date || task.due_date) && (
                      <div className="flex items-center gap-1.5 text-xs text-white/40 min-w-[120px] justify-end">
                        <Calendar className="w-3.5 h-3.5" />
                        {mounted ? (task.due_date ? formatDate(task.due_date) : formatDate(task.start_date)) : "..."}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
