import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { TaskList } from "@/components/tasks/task-list"

function getGreeting(){
  const peruTime = new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
  const hour = new Date(peruTime).getHours()

  if (hour >=5 && hour < 12) {
    return "Buenos días"
  } else if (hour >= 12 && hour < 19) {
    return "Buenas tardes"
  } else {
    return "Buenas noches"
  }
}

async function DashboardContent() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  const greeting = getGreeting()
  const firstName = profile.full_name?.split(" ")[0] || "Usuario"

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto glass-panel p-6 md:p-8 min-h-[85vh]">
        <TaskList userId={user.id} greeting={greeting} firstName={firstName} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
        <div className="min-h-[85vh] max-w-[1400px] mx-auto glass-panel flex items-center justify-center text-white/70">
          Cargando...
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
