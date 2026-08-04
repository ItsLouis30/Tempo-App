"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ListTodo, Timer, Calendar } from "lucide-react"

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      })

      if (error) throw error

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0a] theme-midnight",
        className
      )}
      {...props}
    >
      {/* Fondo degradado igual al del Dashboard (Shared Board) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(var(--theme-bg-start), 0.9) 0%, rgba(var(--theme-bg-end), 1) 100%)",
          backgroundColor: "rgb(var(--theme-bg-end))"
        }}
      />
      {/* CARD CONTENEDORA (Glassmorphic) */}
      <div className="relative z-10 flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl glass-panel border border-border/40">

        {/* Panel izquierdo - Bienvenida */}
        <div className="hidden md:flex w-1/2 bg-transparent flex-col items-center justify-center p-12 border-r border-border/40">
          <div className="max-w-sm w-full flex flex-col h-full justify-between">
            {/* Logo Section */}
            <div>
              <div className="mb-8 inline-block">
                <img
                  src="/logo.png"
                  alt="Tempo Logo"
                  className="w-20 h-auto transition-transform duration-300 hover:scale-110 hover:rotate-3"
                />
              </div>
              <h1 className="text-4xl font-bold mb-1 text-foreground drop-shadow-lg">
                Unete a Tempo 
              </h1>
              <p className="text-lg text-muted-foreground drop-shadow-md mb-8">
                Crea tu cuenta y empieza a organizar tu productividad
              </p>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground mb-4">Lo que puedes hacer:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <ListTodo className="w-7 h-7 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Gestión de Tareas</p>
                    <p className="text-sm text-muted-foreground">Crea y organiza tus tareas fácilmente</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Timer className="w-7 h-7 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Pomodoro & Cronómetro</p>
                    <p className="text-sm text-muted-foreground">Mejora tu enfoque con técnicas probadas</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Calendar className="w-7 h-7 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Calendario</p>
                    <p className="text-sm text-muted-foreground">Visualiza tus tareas en el calendario</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="w-full md:w-1/2 bg-transparent p-6 sm:p-8 lg:p-10 relative">
          <div className="w-full max-w-md mx-auto space-y-8">

            <div className="text-center">
              <h2 className="text-shadow-3xl sm:text-4xl font-bold text-foreground mb-2">
                Crear cuenta
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="underline font-semibold text-foreground hover:text-foreground/80"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-lg">
                  Email
                </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 h-12 backdrop-blur-sm"
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground text-lg">
                  Contraseña
                </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Crea una contraseña"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 h-12 backdrop-blur-sm"
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="repeat-password" className="text-foreground text-lg">
                  Repetir contraseña
                </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    placeholder="Repite tu contraseña"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-background/50 h-12 backdrop-blur-sm"
                  />
                </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-lg rounded-xl shadow-md"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}
