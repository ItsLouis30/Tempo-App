"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function AuthListener() {
  useEffect(() => {
    const supabase = createClient()
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        // Forzamos una recarga completa para limpiar el estado de React 
        // y evitar flashes de componentes sin datos.
        window.location.href = "/auth/login"
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}
