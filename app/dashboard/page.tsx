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
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white drop-shadow-md">{greeting}, {firstName}</h1>
            <p className="text-white/70 md:text-xl font-medium">Hoy es un buen día para avanzar. ¿Qué tienes planeado?</p>
          </div>
        </div>
        <TaskList userId={user.id} />
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
