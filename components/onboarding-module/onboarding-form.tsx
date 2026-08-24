"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OnboardingFormProps {
  userId: string
  existingProfile: { full_name?: string; avatar_url?: string } | null
}

export function OnboardingForm({ userId, existingProfile }: OnboardingFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(existingProfile?.full_name || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        onboarding_completed: true,
      })

      if (error) throw error

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error al guardar el perfil. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="fullName" className="text-sm font-medium text-white/80">Nombre</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Ej: Juan Pérez"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
          className="h-12 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 rounded-xl"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-11 rounded-xl bg-white text-black hover:bg-gray-200 font-medium transition-all" 
        disabled={loading}
      >
        {loading ? "Guardando..." : "Continuar"}
      </Button>
    </form>
  )
}
