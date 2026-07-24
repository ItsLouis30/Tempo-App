import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { PomodoroTimerClient } from "@/components/pomodoro-module/pomodoro-timer-client"
import Page from "@/app/auth/error/page"
import ShapeOverlay from "@/components/transition/shape-overlay-pomodoro"

async function PomodoroContent({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single()

  if (!task) {
    notFound()
  }

  return (
    <>
      {/* Fondo Pomodoro fijo: El rojo domina, silenciando los colores del workspace */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#8B4444]/90 via-[#8B4444]/85 to-black/95 pointer-events-none" />
      <div className="fixed inset-0 z-[-1] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-400/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="p-8 md:p-12 relative w-full flex-1">
        <PomodoroTimerClient task={task} userId={user.id} />
      </div>
    </>
  )
}

export default function PomodoroPage({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  return (
    <Suspense
      
      fallback={<ShapeOverlay />}
    >
      <PomodoroContent params={params} />
    </Suspense>
  )
}
