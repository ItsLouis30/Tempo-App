"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfileEditFormProps {
  userId: string
  profile: {
    full_name?: string
    avatar_url?: string
  }
}

export function ProfileEditForm({ userId, profile }: ProfileEditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
        })
        .eq("id", userId)

      if (error) throw error

      alert("Perfil actualizado correctamente")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error al actualizar el perfil. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="fullName" className="text-sm font-medium text-white/80">Nombre Completo</Label>
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

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full sm:w-auto h-11 px-8 rounded-xl bg-white text-black hover:bg-gray-200 font-medium transition-all"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push("/dashboard")} 
          disabled={loading}
          className="w-full sm:w-auto h-11 px-8 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white font-medium transition-all"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
