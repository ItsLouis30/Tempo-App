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
    <div className="min-h-screen w-full bg-[#4D4D4D] flex items-center justify-center p-4">
        <div className="max-w-md bg-[#2B2B2B] w-[600px] rounded-2xl overflow-hidden shadow-2xl">
          <div className="w-[400px] max-w-md items-center justify-center p-10 mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">Completa tu nombre</h1>
              <p className="text-white text-sm opacity-80">Por favor completa tu información para comenzar</p>
            </div>
            <Suspense fallback={<div className="text-center text-muted-foreground">Cargando...</div>}>
              <OnboardingContent />
            </Suspense>
          </div>
        </div>
    </div>
  )
}
