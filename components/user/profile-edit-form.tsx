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
      <div className="space-y-2 px-36">
        <Label htmlFor="fullName" className="drop-shadow-md">Nombre</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Juan Pérez"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="flex gap-4 px-36">
        <Button type="submit" disabled={loading} className="shadow-md">
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
        <Button type="button" className="shadow-md" variant="outline" onClick={() => router.push("/dashboard")} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
