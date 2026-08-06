"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Bell, X, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { useReminders } from "@/hooks/use-reminders"

interface MobileNotificationsPanelProps {
  userId: string | undefined
}

export function MobileNotificationsPanel({ userId }: MobileNotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { reminders, markAsSent } = useReminders(userId)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setUnreadCount(reminders.length)
  }, [reminders])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)

    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }))
    const peruDate = new Date(date.toLocaleString("en-US", { timeZone: "America/Lima" }))
    const diffMs = peruDate.getTime() - now.getTime()

    if (diffMs < 0) {
      return "Vencido"
    }

    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Ahora"
    if (diffMins < 60) return `En ${diffMins}m`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `En ${diffHours}h`

    const diffDays = Math.floor(diffHours / 24)
    return `En ${diffDays}d`
  }

  const formatFullTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-PE", {
      timeZone: "America/Lima",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-full flex items-center justify-center text-white bg-transparent border-none shadow-none relative"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && mounted && createPortal(
        <>
          {/* Overlay for mobile */}
          <div 
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Notifications Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 w-full bg-[#111111]/95 border-t border-white/10 rounded-t-3xl shadow-2xl z-[100] max-h-[85vh] overflow-y-auto backdrop-blur-xl animate-in slide-in-from-bottom-8 duration-300">
            {/* Mobile handle indicator */}
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2" />
          
          {/* Header */}
          <div className="sticky top-0 bg-[#111111]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary shadow-lg" />
              <h3 className="font-semibold text-base drop-shadow-sm text-white">Recordatorios</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                  {unreadCount}
                </span>
              )}
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="p-8 text-center text-white/50">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Bell className="h-6 w-6 text-primary/50" />
                </div>
              </div>
              <p className="text-sm font-medium">No hay recordatorios</p>
              <p className="text-xs mt-1">Todos tus recordatorios están al día</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10 px-2 pb-6">
              {reminders.map((reminder) => {
                const isTaskReminder = !!reminder.task_id
                const timeLeft = formatTime(reminder.remind_at)
                const isExpired = timeLeft === "Vencido"

                return (
                  <div
                    key={reminder.id}
                    className={`p-4 mx-2 my-2 rounded-2xl border transition-all hover:shadow-md ${
                      isExpired
                        ? "bg-red-500/5 border-red-500/20"
                        : isTaskReminder
                          ? "bg-blue-500/5 border-blue-500/20"
                          : "bg-amber-500/5 border-amber-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {isExpired ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : isTaskReminder ? (
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-500" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm truncate text-white">
                              {reminder.task_title}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/90">
                              {isTaskReminder ? "Tarea" : "Recordatorio"}
                            </span>
                          </div>

                          {reminder.message && (
                            <p className="text-xs text-white/60 mt-1 line-clamp-2">
                              {reminder.message}
                            </p>
                          )}

                          <div className="flex items-center gap-1.5 mt-2">
                            <Clock className="h-3.5 w-3.5 text-white/40" />
                            <span className={`text-xs font-medium ${isExpired ? "text-red-400" : "text-white/60"}`}>
                              {isExpired ? "Vencido" : timeLeft}
                            </span>
                            <span className="text-xs text-white/40">
                              • {formatFullTime(reminder.remind_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dismiss Button */}
                      <button
                        onClick={() => {
                          markAsSent(reminder.id)
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 group"
                        title="Descartar"
                      >
                        <X className="h-5 w-5 text-white/40 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        </>,
        document.body
      )}
    </>
  )
}
