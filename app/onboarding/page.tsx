import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "@/components/onboarding-module/onboarding-form"
import { Suspense } from "react"

async function OnboardingContent() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if profile exists and is completed
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If onboarding is already completed, redirect to dashboard
  if (profile?.onboarding_completed) {
    redirect("/dashboard")
  }

  return <OnboardingForm userId={user.id} existingProfile={profile} />
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-80" style={{ background: "linear-gradient(135deg, rgba(var(--theme-bg-start), 0.8) 0%, rgba(var(--theme-bg-end), 1) 100%)" }} />
      <div className="absolute top-0 left-1/4 w-[80vw] h-[60vh] bg-white/[0.02] rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[60vw] h-[60vh] bg-white/[0.02] rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Tempo Logo" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow-md">Último paso</h1>
          <p className="text-white/60 text-sm">¿Cómo te gustaría que te llamemos?</p>
        </div>
        <Suspense fallback={<div className="text-center text-white/50">Cargando...</div>}>
          <OnboardingContent />
        </Suspense>
      </div>
    </div>
  )
}
