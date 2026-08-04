"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ListTodo, Timer, Calendar } from "lucide-react"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Cargar credenciales guardadas al montar
  useEffect(() => {
    const savedEmail = localStorage.getItem("organizador_email")
    const savedPassword = localStorage.getItem("organizador_password")
    
    // Limpieza de seguridad: borrar contraseña si estaba guardada en versiones anteriores
    if (savedPassword) {
      localStorage.removeItem("organizador_password")
    }

    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // Guardar el email si 'recuérdame' está activo (el navegador maneja la contraseña)
      if (rememberMe) {
        localStorage.setItem("organizador_email", email)
      } else {
        localStorage.removeItem("organizador_email")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div
      className={cn(
        "relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-background",
        className
      )}
      {...props}
    >
      {/* Capa sutil para hacer el fondo un poco más gris (heredando del color del texto para modo oscuro/claro) */}
      <div className="absolute inset-0 bg-foreground/[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/5 via-background/95 to-background pointer-events-none" />
      {/* CARD CONTENEDORA (Glassmorphic) */}
      <div className="relative z-10 flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl glass-panel border border-border/40">

        {/* Panel izquierdo - Bienvenida */}
        <div className="hidden md:flex w-1/2 bg-transparent flex-col items-center justify-center p-12 border-r border-border/40">
        <div className="max-w-sm w-full flex flex-col h-full justify-between">
          {/* Logo Section */}
          <div>
            <div className="mb-1 inline-block">
              <img
                src="/logo.png"
                alt="Tempo Logo"
                className="w-20 h-auto transition-transform duration-300 hover:scale-110 hover:rotate-3"
              />
            </div>

            <h1 className="text-4xl font-bold mb-1 text-foreground drop-shadow-lg">
              Bienvenido a Tempo
            </h1>
            <p className="text-lg text-muted-foreground drop-shadow-md mb-4">
              Estás a un paso de mejorar tu productividad
            </p>
          </div>

          {/* Features Section */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-foreground mb-1">Lo que puedes hacer:</h3>
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

          {/* GitHub Section */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-3">Sígueme en GitHub:</p>
            <a
              href="https://github.com/ItsLouis30"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full md:w-1/2 bg-transparent p-6 sm:p-8 lg:p-10 pt-16 sm:pt-16 lg:pt-16 relative">
        <div className="w-full max-w-md mx-auto space-y-10">

          <div className="text-center">
            <h2 className="text-shadow-3xl sm:text-4xl font-bold text-foreground mb-6">
              Iniciar sesión
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Crea una{" "}
              <Link
                href="/auth/sign-up"
                className="underline font-semibold text-foreground hover:text-foreground/80"
              >
                cuenta nueva aquí
              </Link>{" "}
              o introduce tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="Ingresa tu contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 h-12 backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setRememberMe(checked === true)
                }
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Recuérdame
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg rounded-xl shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
)
}
