"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useRadixToast } from "@/components/ui/toast-provider"

export function AuthListener() {
  const router = useRouter()
  const { showToast } = useRadixToast()
  
  useEffect(() => {
    const supabase = createClient()
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        showToast("Sesión expirada", "Por seguridad, tu sesión ha sido cerrada.")
        router.push("/auth/login")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, showToast])

  return null
}
