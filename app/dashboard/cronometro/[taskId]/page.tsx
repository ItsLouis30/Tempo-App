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
    <div className="min-h-screen bg-[#526D96] p-8 md:p-12">
      <CronometroTimerClient task={task} userId={user.id} />
    </div>
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
