import React from "react"
import { Task } from "@/types"
import { Tag as TagIcon, BarChart3 } from "lucide-react"

interface ProductivityWidgetProps {
  tasks: Task[]
}

export function ProductivityWidget({ tasks }: ProductivityWidgetProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === "done").length
  const pendingTasks = totalTasks - completedTasks
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  // Priority Breakdown (Pending Tasks)
  const pendingList = tasks.filter(t => t.status !== "done")
  const highPriority = pendingList.filter(t => t.priority === 1).length
  const medPriority = pendingList.filter(t => t.priority === 2).length
  const lowPriority = pendingList.filter(t => t.priority === 3).length

  // Tag usage count
  const tagCounts: Record<string, { name: string, count: number, color: string }> = {}
  tasks.forEach(task => {
    if (task.tags) {
      task.tags.forEach(tag => {
        if (!tagCounts[tag.id]) {
          tagCounts[tag.id] = { name: tag.name, count: 0, color: tag.color || "#888" }
        }
        tagCounts[tag.id].count += 1
      })
    }
  })
  
  const topTags = Object.values(tagCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/90 bg-white/10 px-4 py-2 rounded-full inline-flex items-center gap-2 backdrop-blur-sm border border-white/5 shadow-sm">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          Resumen de Productividad
        </h3>
      </div>

      <div className="glass-card flex flex-col p-6 group shadow-lg space-y-6">
        
        {/* Progress Ring & Stats */}
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            {/* Background Circle */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/10"
              />
              {/* Progress Circle */}
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={226} /* 2 * PI * r */
                strokeDashoffset={226 - (226 * progressPercent) / 100}
                className="text-green-400 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{progressPercent}%</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 flex-1">
            <h4 className="text-white font-medium flex items-center gap-2">
              Progreso General
            </h4>
            <p className="text-sm text-white/60">
              Has completado {completedTasks} de {totalTasks} tareas.
            </p>
            {progressPercent === 100 && totalTasks > 0 && (
              <p className="text-xs text-green-400 font-medium mt-1">¡Día perfecto! 🎉</p>
            )}
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Priority Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-white/80 flex items-center gap-2 mb-3">
            Pendientes por Prioridad
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center transition-colors hover:bg-white/10">
              <span className="block text-xl font-bold text-red-400">{highPriority}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Altas</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center transition-colors hover:bg-white/10">
              <span className="block text-xl font-bold text-yellow-400">{medPriority}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Medias</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center transition-colors hover:bg-white/10">
              <span className="block text-xl font-bold text-blue-400">{lowPriority}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Bajas</span>
            </div>
          </div>
        </div>

        {/* Tags Overview (Optional) */}
        {topTags.length > 0 && (
          <>
            <hr className="border-white/10" />
            <div>
              <h4 className="text-sm font-medium text-white/80 flex items-center gap-2 mb-3">
                <TagIcon className="w-4 h-4 text-pink-400" />
                Etiquetas Frecuentes
              </h4>
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                    <span className="text-xs text-white/70">{tag.name}</span>
                    <span className="text-xs font-bold text-white/90 ml-1">{tag.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
      </div>
    </div>
  )
}
