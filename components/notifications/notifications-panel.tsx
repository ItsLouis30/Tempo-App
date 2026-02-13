'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useReminders } from '@/hooks/use-reminders'

interface NotificationsPanelProps {
  userId: string | undefined
}

export function NotificationsPanel({ userId }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { reminders, markAsSent } = useReminders(userId)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(reminders.length)
  }, [reminders])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }))
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Lima' }))
    const diffMs = peruDate.getTime() - now.getTime()

    if (diffMs < 0) {
      return 'Vencido'
    }

    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `En ${diffMins}m`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `En ${diffHours}h`

    const diffDays = Math.floor(diffHours / 24)
    return `En ${diffDays}d`
  }

  const formatFullTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-accent rounded-md transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gradient-to-b from-background to-background/95 border border-border/50 rounded-xl shadow-2xl z-50 max-h-[500px] overflow-y-auto backdrop-blur-sm">
          {/* Header */}
          <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary shadow-lg" />
              <h3 className="font-semibold text-base drop-shadow-sm">Recordatorios</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {reminders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Bell className="h-6 w-6 text-primary/50" />
                </div>
              </div>
              <p className="text-sm font-medium">No hay recordatorios</p>
              <p className="text-xs mt-1">Todos tus recordatorios están al día</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {reminders.map((reminder) => {
                const isTaskReminder = !!reminder.task_id
                const timeLeft = formatTime(reminder.remind_at)
                const isExpired = timeLeft === 'Vencido'

                return (
                  <div
                    key={reminder.id}
                    className={`p-3.5 mx-2 my-2 rounded-lg border transition-all hover:shadow-md ${
                      isExpired
                        ? 'bg-red-50/30 dark:bg-red-950/20 border-red-200/30 dark:border-red-800/30'
                        : isTaskReminder
                          ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200/30 dark:border-blue-800/30'
                          : 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/30 dark:border-amber-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
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
                            <p className="font-semibold text-sm truncate">
                              {reminder.task_title}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                              {isTaskReminder ? 'Tarea' : 'Recordatorio'}
                            </span>
                          </div>

                          {reminder.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {reminder.message}
                            </p>
                          )}

                          <div className="flex items-center gap-1.5 mt-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className={`text-xs font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                              {isExpired ? 'Vencido' : timeLeft}
                            </span>
                            <span className="text-xs text-muted-foreground">
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
                        className="p-1.5 hover:bg-accent rounded-lg transition-colors flex-shrink-0 group"
                        title="Descartar"
                      >
                        <X className="h-4 w-4 group-hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
