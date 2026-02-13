'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useNotificationSound } from './use-notification-sound'

export interface Reminder {
  id: string
  task_id: string | null
  user_id: string
  remind_at: string
  message: string | null
  sent: boolean
  created_at: string
  task_title?: string
}

export function useReminders(userId: string | undefined) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [triggeredReminders, setTriggeredReminders] = useState<Set<string>>(new Set())
  const { playSound } = useNotificationSound()
  const supabase = createClient()
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchReminders = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const { data: remindersData, error } = await supabase
        .from('reminders')
        .select(`
          id,
          task_id,
          user_id,
          remind_at,
          message,
          sent,
          created_at,
          task:task_id(title)
        `)
        .eq('user_id', userId)
        .eq('sent', false)
        .order('remind_at', { ascending: true })

      if (error) throw error

      const formattedReminders = (remindersData || []).map((reminder: any) => ({
        ...reminder,
        task_title: reminder.task?.title,
      }))

      setReminders(formattedReminders)
    } catch (error) {
      console.log('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const triggerNotification = useCallback((reminder: Reminder) => {
    playSound()

    const isTaskReminder = !!reminder.task_id
    const title = isTaskReminder ? 'Recordatorio de Tarea' : 'Recordatorio'
    const body = reminder.message || (isTaskReminder ? `${reminder.task_title} - ¡Es hora de empezar!` : 'Tienes un recordatorio')

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.png',
        tag: reminder.id,
      })
    }
  }, [playSound])

  const checkReminders = useCallback(() => {
    const now = Date.now()

    reminders.forEach((reminder) => {
        const remindTime = new Date(reminder.remind_at).getTime()
        const timeDiff = remindTime - now

        if (
        timeDiff <= 0 &&
        timeDiff > -5000 &&
        !triggeredReminders.has(reminder.id)
        ) {
        triggerNotification(reminder)
        setTriggeredReminders((prev) => new Set(prev).add(reminder.id))
        }
    })
    }, [reminders, triggeredReminders, triggerNotification])


  const markAsSent = useCallback(async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ sent: true })
        .eq('id', reminderId)

      if (error) throw error

      setReminders((prev) => prev.filter((r) => r.id !== reminderId))
    } catch (error) {
      console.log('Error marking reminder as sent:', error)
    }
  }, [supabase])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  useEffect(() => {
    checkReminders()
    checkIntervalRef.current = setInterval(checkReminders, 1000)

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [checkReminders])

  useEffect(() => {
    if (!userId) return

    const subscription = supabase
      .channel(`reminders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchReminders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId, supabase, fetchReminders])

  return {
    reminders,
    loading,
    markAsSent,
    refreshReminders: fetchReminders,
  }
}
