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
              <div className="mb-8 inline-block">
                <img
                  src="/logo.png"
                  alt="Tempo Logo"
                  className="w-20 h-auto transition-transform duration-300 hover:scale-110 hover:rotate-3"
                />
              </div>
              <h1 className="text-4xl font-bold mb-1 text-gray-900 drop-shadow-lg">
                Unete a Tempo 
              </h1>
              <p className="text-lg text-[#100F0F] drop-shadow-md mb-8">
                Crea tu cuenta y empieza a organizar tu productividad
              </p>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lo que puedes hacer:</h3>
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

          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="w-full md:w-1/2 bg-[#2B2B2B] p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md mx-auto space-y-8">

            <div className="text-center">
              <h2 className="text-shadow-3xl sm:text-4xl font-bold text-white mb-2">
                REGÍSTRATE AHORA
              </h2>
              <p className="text-sm sm:text-base text-gray-300">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="underline font-semibold hover:text-white"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
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
                  placeholder="Crea una contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-200 border-0 h-12 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat-password" className="text-white text-lg">
                  Repetir contraseña
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder="Repite tu contraseña"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="bg-gray-200 border-0 h-12 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}
