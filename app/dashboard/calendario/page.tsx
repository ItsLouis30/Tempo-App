import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CalendarClient from "@/components/calendar/calendar-client"

export default async function CalendarioPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single()

  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, due_date, priority, status, description")
    .eq("user_id", user.id)
    .neq("status", "done")
    .not("due_date", "is", null)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 space-y-6">
        <div className="pt-8 px-4">
          <h1 className="text-3xl font-bold drop-shadow-lg">Calendario</h1>
          <p className="text-muted-foreground drop-shadow-lg">
            Visualiza tus tareas según su fecha límite y añade recordatorios.
          </p>
        </div>

        <CalendarClient tasks={tasks ?? []} />
      </div>
    </div>
  )
}
