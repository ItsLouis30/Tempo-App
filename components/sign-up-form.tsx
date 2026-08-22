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
import { ListTodo, Timer, Calendar, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react"

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)

  const router = useRouter()

  // Password requirements calculation
  const reqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const strength = Object.values(reqs).filter(Boolean).length

  // Helper component for requirements list
  const ReqItem = ({ fulfilled, text }: { fulfilled: boolean, text: string }) => (
    <div className={`flex items-center gap-2 transition-colors duration-300 ${fulfilled ? 'text-green-400' : 'text-white/40'}`}>
      {fulfilled ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  )

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

    if (strength < 4) {
      setError("La contraseña no cumple con todos los requisitos")
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
        <div className="w-full md:w-1/2 bg-transparent p-6 sm:p-10 lg:p-12 pt-12 sm:pt-16 relative flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-8">

            {/* Identidad Móvil */}
            <div className="md:hidden flex flex-col items-center justify-center mb-2">
              <img
                src="/logo.png"
                alt="Tempo Logo"
                className="w-16 h-auto mb-3 drop-shadow-md"
              />
              <h1 className="text-xl font-bold text-foreground tracking-wide">Tempo</h1>
            </div>

            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea una contraseña"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 h-12 backdrop-blur-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                <div className="pt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                          strength >= level 
                            ? (strength <= 2 ? 'bg-red-500' : strength === 3 ? 'bg-yellow-500' : 'bg-green-500')
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <ReqItem fulfilled={reqs.length} text="Mínimo 8 caracteres" />
                    <ReqItem fulfilled={reqs.uppercase} text="Una letra mayúscula" />
                    <ReqItem fulfilled={reqs.number} text="Un número" />
                    <ReqItem fulfilled={reqs.special} text="Un carácter especial" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat-password" className="text-foreground text-lg">
                  Repetir contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="repeat-password"
                    type={showRepeatPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-background/50 h-12 backdrop-blur-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
