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
    <div className="min-h-screen bg-background p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-foreground drop-shadow-lg">{greeting}, {firstName}</h1>
          <p className="text-muted-foreground md:text-xl drop-shadow-lg">Hoy es un buen día para avanzar. ¿Qué tienes planeado?</p>
        </div>
        <TaskList userId={user.id} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-8 md:p-12">
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Cargando...</div>
    </div>}>
      <DashboardContent />
    </Suspense>
  )
}
