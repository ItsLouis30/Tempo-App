import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileEditForm } from "@/components/user/profile-edit-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/onboarding")
  }

  return (
    <div className="min-h-screen bg-background p-8 md:p-12">
      <h1 className="text-3xl font-bold mb-6 px-36 drop-shadow-lg">Editar nombre</h1>
      <ProfileEditForm userId={user.id} profile={profile} />
    </div>
  )
}
