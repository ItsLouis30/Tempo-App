import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { CronometroTimerClient } from "@/components/cronometro-module/cronometro-libre-client"
import ShapeOverlay from "@/components/transition/shape-overlay-cronometro"

async function CronometroContent({
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
      {/* Fondo Cronómetro fijo: El azul/gris domina, silenciando los colores del workspace */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-[#526D96]/90 via-[#526D96]/85 to-black/95 pointer-events-none" />
      <div className="fixed inset-0 z-[-1] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#526D96]/30 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="px-8 py-2 md:px-12 md:py-4 relative w-full flex-1">
        <CronometroTimerClient task={task} userId={user.id} />
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
      fallback={
        <ShapeOverlay />
      }
    >
      <CronometroContent params={params} />
    </Suspense>
  )
}
