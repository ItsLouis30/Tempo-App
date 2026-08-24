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
    <div className="w-full max-w-2xl mx-auto p-6 md:p-10 mt-8 md:mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-white tracking-tight drop-shadow-md">Configuración de perfil</h1>
        <ProfileEditForm userId={user.id} profile={profile} />
      </div>
    </div>
  )
}
