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

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("organizador_email")
    const savedPassword = localStorage.getItem("organizador_password")
    if (savedEmail) {
      setEmail(savedEmail)
      setPassword(savedPassword || "")
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

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("organizador_email", email)
        localStorage.setItem("organizador_password", password)
      } else {
        localStorage.removeItem("organizador_email")
        localStorage.removeItem("organizador_password")
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
      "min-h-screen w-full bg-[#4D4D4D] flex items-center justify-center p-4",
      className
    )}
    {...props}
  >
    {/* CARD CONTENEDORA */}
    <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl">

      {/* Panel izquierdo - Bienvenida */}
      <div className="hidden md:flex w-1/2 bg-[#D9D9D9] flex-col items-center justify-center p-12">
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

            <h1 className="text-4xl font-bold mb-1 text-gray-900 drop-shadow-lg">
              Bienvenido a Tempo
            </h1>
            <p className="text-lg text-[#100F0F] drop-shadow-md mb-4">
              Estás a un paso de mejorar tu productividad
            </p>
          </div>

          {/* Features Section */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Lo que puedes hacer:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-semibold text-gray-900">Gestión de Tareas</p>
                  <p className="text-sm text-gray-700">Crea y organiza tus tareas fácilmente</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="font-semibold text-gray-900">Pomodoro & Cronómetro</p>
                  <p className="text-sm text-gray-700">Mejora tu enfoque con técnicas probadas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-semibold text-gray-900">Calendario</p>
                  <p className="text-sm text-gray-700">Visualiza tus tareas en el calendario</p>
                </div>
              </div>
            </div>
          </div>

          {/* GitHub Section */}
          <div className="mt-8 pt-6 border-t border-gray-400">
            <p className="text-sm text-gray-700 mb-3">Sígueme en GitHub:</p>
            <a
              href="https://github.com/ItsLouis30"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors font-semibold"
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
      <div className="w-full md:w-1/2 bg-[#2B2B2B] p-6 sm:p-8 lg:p-10 pt-16 sm:pt-16 lg:pt-16">
        <div className="w-full max-w-md mx-auto space-y-10">

          <div className="text-center">
            <h2 className="text-shadow-3xl sm:text-4xl font-bold text-white mb-6">
              INICIAR SESIÓN
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              Crea una{" "}
              <Link
                href="/auth/sign-up"
                className="underline font-semibold hover:text-white"
              >
                cuenta nueva aquí
              </Link>{" "}
              o introduce tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-lg">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-200 border-0 h-12 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-lg">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-200 border-0 h-12 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setRememberMe(checked as boolean)
                }
                className="border-gray-400"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-300 cursor-pointer"
              >
                Recuérdame
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
)
}
