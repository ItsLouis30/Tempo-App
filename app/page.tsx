"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, ArrowRight, CheckCircle2 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function ScrollReveal({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        if (domRef.current) observer.unobserve(domRef.current);
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    
    if (domRef.current) observer.observe(domRef.current);
    
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out w-full ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.95]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const navItems = [
  { id: 'hero', label: 'Inicio' },
  { id: 'tareas', label: 'Gestión de tareas y Calendario' },
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'musica', label: 'Entorno inmersivo' },
  { id: 'temas', label: 'Personalización y Tableros' }
];

const getTargetScroll = (index: number, st: any) => {
  if (index === 0) return 0;
  if (!st) return 0;
  
  const start = st.start;
  const distance = st.end - st.start;
  
  if (index === 1) return start;
  if (index === 2) return start + distance * 0.25;
  if (index === 3) return start + distance * 0.50;
  if (index === 4) return start + distance * 0.75;
  
  return 0;
};

const featuresData = [
  {
    title: "Gestión de tareas y calendario.",
    description: "Visualiza tus compromisos, organiza subtareas y asigna fechas de entrega en un solo lugar. Una vista de calendario integrada te permite planificar tu semana sin salir de tu flujo de trabajo.",
    bullets: ["Listas y etiquetas personalizadas.", "Vista mensual y semanal nativa."],
    images: ["/screenshots/tasks.png"],
    imageClass: "scale-100 origin-center",
    imageHoverClass: "group-hover:scale-[1.03]"
  },
  {
    title: "Método Pomodoro integrado.",
    description: "Temporizadores de concentración y descansos integrados directamente en tu lista de tareas. Mide tu tiempo real de trabajo y mantén el enfoque sin depender de aplicaciones externas.",
    bullets: ["Temporizadores configurables.", "Notificaciones de descanso."],
    images: ["/screenshots/pomodoro.png"],
    imageClass: "scale-100 origin-center",
    imageHoverClass: "group-hover:scale-[1.03]"
  },
  {
    title: "Entorno inmersivo.",
    description: "Entra en la zona con controles de entorno integrados. Vincula tu cuenta de Spotify para controlar tu música o reproduce sonidos ambientales (lluvia, cafetería, lo-fi) directamente desde la interfaz.",
    bullets: ["Reproductor nativo de Spotify.", "Mezclador de ruido blanco."],
    images: ["/screenshots/audio.png"],
    imageClass: "scale-100 origin-center",
    imageHoverClass: "group-hover:scale-[1.03]"
  },
  {
    title: "Personalización y tableros compartidos.",
    description: "Haz que Tempo sea verdaderamente tuyo con paletas de colores dinámicas (como Midnight, Forest u Ocean). Además, puedes generar enlaces públicos de tus tableros para compartir tu estado o progreso de solo lectura.",
    bullets: ["Múltiples temas de Glassmorphism.", "Vistas compartidas seguras."],
    images: ["/screenshots/themes.png", "/screenshots/shared.png"],
    imageClass: "scale-100 origin-center",
    imageHoverClass: "group-hover:scale-[1.03]"
  }
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeNavIndex, setActiveNavIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
    
    let ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 768px)": function() {
          const st = ScrollTrigger.create({
            trigger: pinContainerRef.current,
            start: "top top",
            end: "+=300%", // Scroll distance
            pin: true,
            scrub: true,
            onUpdate: (self) => {
              // Map progress (0 to 1) to slide index (0 to 3)
              // Because end is +=300%, we have 4 slides total over the span of 3 viewports.
              // We can use progress * 3 + 0.5 to snap smoothly, or simple boundaries.
              let idx = Math.min(3, Math.floor(self.progress * 4));
              // Small bias to ensure we hit 3 at the very end
              if (self.progress > 0.9) idx = 3; 
              setActiveSlide(idx);
            }
          });
          scrollTriggerRef.current = st;
        }
      });
    }, pinContainerRef);

    const handleScroll = () => {
       const scrollY = window.scrollY;
       const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
       setScrollProgress(maxScroll > 0 ? scrollY / maxScroll : 0);

       const st = scrollTriggerRef.current;
       if (!st) {
          if (scrollY < 500) setActiveNavIndex(0);
          else setActiveNavIndex(1);
          return;
       }

       const start = st.start;
       const end = st.end;
       
       let newIdx = 0;
       if (scrollY < start - 200) newIdx = 0;
       else {
         const p = st.progress;
         if (p < 0.25) newIdx = 1;
         else if (p < 0.50) newIdx = 2;
         else if (p < 0.75) newIdx = 3;
         else newIdx = 4;
       }
       setActiveNavIndex(newIdx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call after a tiny delay to allow GSAP to calculate start/end
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      ctx.revert();
    };
  }, []);

  return (
    <div className="min-h-screen theme-midnight relative bg-[#0a0a0a] text-foreground font-sans overflow-x-hidden">
      
      {/* Vertical Navigation Indicator */}
      <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-[110] flex-col items-center gap-6 group/nav opacity-40 hover:opacity-100 transition-opacity duration-500 py-4">
        {/* The connecting line (background) */}
        <div className="absolute top-6 bottom-6 left-1/2 -translate-x-1/2 w-[1px] bg-white/10 -z-10" />
        
        {/* The filling line */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[1px] bg-white/60 -z-10 transition-all duration-100 ease-out" style={{ height: `calc(${scrollProgress} * (100% - 48px))` }} />

        {navItems.map((item, i) => (
          <div 
            key={i}
            className="relative flex items-center justify-center cursor-pointer w-6 h-6"
            onClick={() => {
              const targetY = getTargetScroll(i, scrollTriggerRef.current);
              window.scrollTo({ top: targetY, behavior: 'smooth' });
            }}
          >
             {/* Tooltip */}
             <div className="absolute left-8 px-3 py-1.5 rounded-md bg-[#121214]/90 backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium whitespace-nowrap opacity-0 group-hover/nav:opacity-100 -translate-x-4 group-hover/nav:translate-x-0 transition-all duration-300 pointer-events-none shadow-lg">
                {item.label}
             </div>
             
             {/* Dot */}
             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
               activeNavIndex === i 
                 ? 'bg-white scale-150 shadow-[0_0_12px_rgba(255,255,255,1)]' 
                 : (activeNavIndex > i ? 'bg-white/60' : 'bg-white/20 hover:bg-white/50 hover:scale-125')
             }`} />
          </div>
        ))}
      </div>

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
        <header className="fixed top-0 left-0 right-0 z-[100] w-full py-4 px-6 md:px-12 bg-[#0a0a0a]/60 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
          <div className="flex h-14 items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2 group cursor-pointer transition-all duration-300">
              <img 
                src="/logo.png" 
                alt="Tempo" 
                width={32} 
                height={32} 
                className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" 
              />
              <span className="font-bold text-xl tracking-wide text-white transition-all duration-300 drop-shadow-md group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
                Tempo
              </span>
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

        <main className="flex-1 flex flex-col items-center w-full mt-14">
          
          {/* Hero Section */}
          <section className="px-4 pt-16 pb-16 md:pt-24 md:pb-24 max-w-7xl mx-auto w-full text-center flex flex-col items-center">
            <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center">
              <div className="relative mb-4 group cursor-default">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <img 
                  src="/logo.png" 
                  alt="Tempo Logo" 
                  className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform duration-700 hover:scale-110"
                />
              </div>
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
              <div 
                className="glass-panel p-2 md:p-4 rounded-2xl md:rounded-[2rem] border border-white/10 shadow-2xl"
                style={{ 
                  maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)", 
                  WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" 
                }}
              >
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

          {/* Features Sticky Scroll Presentation */}
          <section className="w-full relative bg-[#0a0a0a] z-20">
            {/* Desktop: Sticky Scroll */}
            <div ref={pinContainerRef} className="hidden md:flex h-screen w-full items-center justify-center overflow-hidden">
              <div className="w-full max-w-7xl mx-auto px-12 flex items-center gap-16 relative">
                
                {/* Text Side (Left) */}
                <div className="w-2/5 relative h-[500px] flex items-center">
                  {featuresData.map((feature, i) => (
                    <div 
                      key={i} 
                      className={`group absolute left-0 right-0 flex flex-col justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        activeSlide === i 
                          ? 'opacity-100 translate-y-0 pointer-events-auto' 
                          : (i < activeSlide 
                              ? 'opacity-0 -translate-y-16 pointer-events-none' 
                              : 'opacity-0 translate-y-16 pointer-events-none'
                            )
                      }`}
                    >
                      <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-sm leading-tight mb-6 transition-all duration-500 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-500 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        {feature.title}
                      </h2>
                      <p className="text-xl text-muted-foreground leading-relaxed mb-8 transition-colors duration-500 group-hover:text-gray-300">
                        {feature.description}
                      </p>
                      <ul className="space-y-4">
                        {feature.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-center text-lg text-muted-foreground transition-colors duration-500 group-hover:text-gray-300">
                            <CheckCircle2 className="w-6 h-6 mr-4 text-white/70" /> 
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Image Side (Right) */}
                <div className="w-3/5 relative h-[600px] flex items-center justify-center">
                  {featuresData.map((feature, i) => (
                    <div 
                      key={i} 
                      className={`absolute inset-0 flex flex-col justify-center transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        activeSlide === i 
                          ? 'opacity-100 scale-100 rotate-0 pointer-events-auto' 
                          : (i < activeSlide 
                              ? 'opacity-0 scale-95 -rotate-2 pointer-events-none' 
                              : 'opacity-0 scale-[1.05] rotate-2 pointer-events-none'
                            )
                      }`}
                    >
                      {feature.images.length === 1 ? (
                        <div className="group glass-panel w-fit mx-auto p-2 rounded-2xl md:rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative transition-all duration-500 hover:scale-[1.03] hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                          <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-muted-foreground text-sm z-0">
                            [Captura de Pantalla]
                          </div>
                          <img src={feature.images[0]} alt={feature.title} className={`relative z-10 w-auto h-auto max-w-full max-h-[550px] object-contain rounded-xl md:rounded-[1.5rem] transition-transform duration-700 ${feature.imageClass} ${feature.imageHoverClass}`} onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 h-full justify-center">
                          {feature.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="group glass-panel w-fit mx-auto p-2 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative min-h-[150px] flex flex-col justify-center transition-all duration-500 hover:scale-[1.03] hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                              <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-muted-foreground text-xs text-center p-4 z-0">
                                [Captura de Pantalla]
                              </div>
                              <img src={img} alt={feature.title} className={`relative z-10 w-auto h-auto max-w-full max-h-[250px] object-contain rounded-xl transition-transform duration-700 ${feature.imageClass} ${feature.imageHoverClass}`} onError={(e) => e.currentTarget.style.display = 'none'} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile: Stacked Fallback */}
            <div className="md:hidden w-full px-4 py-16 space-y-24">
              {featuresData.map((feature, i) => (
                <ScrollReveal key={i}>
                  <div className="group flex flex-col gap-8">
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-white tracking-tight leading-tight transition-all duration-500 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-500 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        {feature.title}
                      </h2>
                      <p className="text-lg text-muted-foreground leading-relaxed transition-colors duration-500 group-hover:text-gray-300">
                        {feature.description}
                      </p>
                      <ul className="space-y-3 pt-2">
                        {feature.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-center text-muted-foreground transition-colors duration-500 group-hover:text-gray-300">
                            <CheckCircle2 className="w-5 h-5 mr-3 text-white/70" /> 
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="w-full">
                      {feature.images.length === 1 ? (
                        <div className="group/img glass-panel w-fit mx-auto p-2 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative transition-all duration-500 hover:scale-[1.03] hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                          <img src={feature.images[0]} alt={feature.title} className={`relative z-10 w-auto h-auto max-w-full max-h-[60vh] object-contain rounded-xl transition-transform duration-700 ${feature.imageClass.replace('group-hover', 'group-hover/img')} ${feature.imageHoverClass.replace('group-hover', 'group-hover/img')}`} onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          {feature.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="group/img glass-panel w-fit mx-auto p-2 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative transition-all duration-500 hover:scale-[1.03] hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                              <img src={img} alt={feature.title} className={`relative z-10 w-auto h-auto max-w-full max-h-[30vh] object-contain rounded-xl transition-transform duration-700 ${feature.imageClass.replace('group-hover', 'group-hover/img')} ${feature.imageHoverClass.replace('group-hover', 'group-hover/img')}`} onError={(e) => e.currentTarget.style.display = 'none'} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
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
              <a href="https://github.com/ItsLouis30/Tempo-App" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
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
