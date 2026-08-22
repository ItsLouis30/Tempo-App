"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { KeyRound, ShieldCheck, MailCheck } from "lucide-react"

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al enviar el correo")
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
              <div className="mb-4 inline-block">
                <img
                  src="/logo.png"
                  alt="Tempo Logo"
                  className="w-20 h-auto transition-transform duration-300 hover:scale-110 hover:rotate-3"
                />
              </div>

              <h1 className="text-4xl font-bold mb-1 text-foreground drop-shadow-lg">
                Recupera tu acceso
              </h1>
              <p className="text-lg text-muted-foreground drop-shadow-md mb-8">
                Es muy fácil recuperar tu cuenta
              </p>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <KeyRound className="w-7 h-7 text-muted-foreground mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Solicita un enlace</p>
                  <p className="text-sm text-muted-foreground">Ingresa el correo asociado a tu cuenta.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MailCheck className="w-7 h-7 text-muted-foreground mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Revisa tu bandeja</p>
                  <p className="text-sm text-muted-foreground">Te enviaremos un enlace seguro para restablecer tu clave.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-7 h-7 text-muted-foreground mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Cuenta protegida</p>
                  <p className="text-sm text-muted-foreground">Tus datos seguirán estando seguros con nosotros.</p>
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

            {success ? (
              <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  <MailCheck size={32} />
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Revisa tu correo
                </h2>
                <p className="text-base text-muted-foreground">
                  Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>.
                </p>
                <div className="pt-6">
                  <Link href="/auth/login" className="text-sm text-primary hover:underline underline-offset-4 font-semibold">
                    ← Volver al inicio de sesión
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
                    Restablecer clave
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Te enviaremos un enlace para crear una nueva contraseña.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
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

                  {error && (
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg rounded-xl shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
                  </Button>
                  
                  <div className="text-center pt-2">
                    <Link
                      href="/auth/login"
                      className="text-sm font-semibold text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      ← Volver a iniciar sesión
                    </Link>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
