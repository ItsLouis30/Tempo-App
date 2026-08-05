"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen theme-midnight relative bg-[#0a0a0a] text-foreground font-sans overflow-x-hidden">
      {/* Background Gradient */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000"
        style={{
          background: "linear-gradient(135deg, rgba(var(--theme-bg-start), 0.9) 0%, rgba(var(--theme-bg-end), 1) 100%)",
          backgroundColor: "rgb(var(--theme-bg-end))"
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header / Navbar */}
        <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-6 md:px-12 backdrop-blur-md bg-transparent border-b border-white/5">
          <div className="flex h-14 items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Tempo" width={32} height={32} className="transition-transform duration-300 hover:scale-105" />
              <span className="font-bold text-xl drop-shadow-md tracking-wide text-white">Tempo</span>
            </div>
            
            <nav className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors hidden sm:block">
                Iniciar sesión
              </Link>
              <Link href="/auth/sign-up">
                <Button className="rounded-full font-semibold bg-white text-[#18181B] hover:bg-gray-200 transition-all shadow-md px-5">
                  Comenzar
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center w-full">
          
          {/* Hero Section */}
          <section className="px-4 pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto w-full text-center flex flex-col items-center">
            <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white text-balance leading-tight drop-shadow-sm">
                Un entorno unificado para gestionar tareas, controlar tiempos y organizar tu día.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-balance mx-auto max-w-2xl mt-4">
                Tempo combina gestión de proyectos, técnica Pomodoro, calendario y controles de entorno (Spotify y sonidos ambientales) en una sola interfaz diseñada para el enfoque profundo.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link href="/auth/sign-up" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full text-base font-semibold bg-white text-[#18181B] hover:bg-gray-100 transition-all group">
                    Crear cuenta
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Main Screenshot */}
            <div className="mt-16 w-full max-w-6xl relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
              <div className="glass-panel p-2 md:p-4 rounded-2xl md:rounded-[2rem] border border-white/10 shadow-2xl">
                <div className="bg-[#121214] rounded-xl md:rounded-[1.5rem] border border-white/5 overflow-hidden aspect-[16/10] relative">
                  {/* Fallback color/skeleton before image loads */}
                  <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-muted-foreground text-sm">
                    [Captura de Pantalla: Dashboard Principal]
                  </div>
                  {/* Imagen real (reemplazar la fuente cuando esté en public/) */}
                  <img 
                    src="/screenshots/dashboard.png" 
                    alt="Dashboard de Tempo" 
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Features Zig-Zag Sections */}
          <section className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 space-y-24 md:space-y-32">
            
            {/* Feature 1: Tasks & Calendar (Text Left, Image Right) */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2 space-y-6 text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Gestión de tareas y calendario.</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Visualiza tus compromisos, organiza subtareas y asigna fechas de entrega en un solo lugar. Una vista de calendario integrada te permite planificar tu semana sin salir de tu flujo de trabajo.
                </p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-center text-muted-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-white/70" /> Listas y etiquetas personalizadas.</li>
                  <li className="flex items-center text-muted-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-white/70" /> Vista mensual y semanal nativa.</li>
                </ul>
              </div>
              <div className="w-full md:w-1/2">
                <div className="glass-panel p-2 rounded-2xl border border-white/10 shadow-xl overflow-hidden aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-muted-foreground text-sm">
                    [Captura: Tareas y Calendario]
                  </div>
                  <img src="/screenshots/tasks.png" alt="Gestión de Tareas" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              </div>
            </div>

            {/* Feature 2: Pomodoro (Image Left, Text Right) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2 space-y-6 text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Método Pomodoro integrado.</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Temporizadores de concentración y descansos integrados directamente en tu lista de tareas. Mide tu tiempo real de trabajo y mantén el enfoque sin depender de aplicaciones externas.
                </p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-center text-muted-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-white/70" /> Temporizadores configurables.</li>
                  <li className="flex items-center text-muted-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-white/70" /> Notificaciones de descanso.</li>
                </ul>
              </div>
              <div className="w-full md:w-1/2">
                <div className="glass-panel p-2 rounded-2xl border border-white/10 shadow-xl overflow-hidden aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-muted-foreground text-sm">
                    [Captura: Pomodoro]
                  </div>
                  <img src="/screenshots/pomodoro.png" alt="Pomodoro" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              </div>
            </div>

            {/* Feature 3: Environment (Text Left, Image Right) */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2 space-y-6 text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Entorno inmersivo.</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Entra en la zona con controles de entorno integrados. Vincula tu cuenta de Spotify para controlar tu música o reproduce sonidos ambientales (lluvia, cafetería, lo-fi) directamente desde la interfaz.
                </p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-center text-muted-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-white/70" /> Reproductor nativo de Spotify.</li>
                  <li className="flex items-center text-muted-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-white/70" /> Mezclador de ruido blanco.</li>
                </ul>
              </div>
              <div className="w-full md:w-1/2">
                <div className="glass-panel p-2 rounded-2xl border border-white/10 shadow-xl overflow-hidden aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-muted-foreground text-sm">
                    [Captura: Sonidos y Spotify]
                  </div>
                  <img src="/screenshots/audio.png" alt="Sonidos Ambientales" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              </div>
            </div>

            {/* Feature 4: Themes & Collaboration (Image Left, Text Right) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2 space-y-6 text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Personalización y tableros compartidos.</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Haz que Tempo sea verdaderamente tuyo con paletas de colores dinámicas (como Midnight, Forest u Ocean). Además, puedes generar enlaces públicos de tus tableros para compartir tu estado o progreso de solo lectura.
                </p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-center text-muted-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-white/70" /> Múltiples temas de Glassmorphism.</li>
                  <li className="flex items-center text-muted-foreground"><CheckCircle2 className="w-5 h-5 mr-3 text-white/70" /> Vistas compartidas seguras.</li>
                </ul>
              </div>
              <div className="w-full md:w-1/2">
                <div className="flex flex-col sm:flex-row gap-4 h-full">
                  <div className="glass-panel p-2 rounded-2xl border border-white/10 shadow-xl overflow-hidden w-full aspect-square sm:aspect-auto sm:h-64 relative">
                    <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-muted-foreground text-xs text-center p-4">
                      [Captura: Temas]
                    </div>
                    <img src="/screenshots/themes.png" alt="Temas" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                  </div>
                  <div className="glass-panel p-2 rounded-2xl border border-white/10 shadow-xl overflow-hidden w-full aspect-square sm:aspect-auto sm:h-64 relative">
                    <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-muted-foreground text-xs text-center p-4">
                      [Captura: Tablero Compartido]
                    </div>
                    <img src="/screenshots/shared.png" alt="Tableros Compartidos" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                  </div>
                </div>
              </div>
            </div>

          </section>

        </main>

        {/* Footer */}
        <footer className="w-full border-t border-white/10 mt-auto py-10 px-6 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <img src="/logo.png" alt="Tempo" width={24} height={24} className="grayscale hover:grayscale-0 transition-all" />
              <span className="font-semibold text-white">Tempo</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; 2026 Tempo. Construido por <a href="https://github.com/ItsLouis30" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">ItsLouis30</a>.
            </p>
            
            <div className="flex items-center gap-4">
              <a href="https://github.com/ItsLouis30/organizador-tareas" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
