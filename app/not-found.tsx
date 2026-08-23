import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0a] theme-midnight text-foreground">
      
      {/* Background Gradients and Texture (Match Landing Page) */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000">
        <div 
          className="absolute inset-0 opacity-80"
          style={{
            background: "linear-gradient(135deg, rgba(var(--theme-bg-start), 0.8) 0%, rgba(var(--theme-bg-end), 1) 100%)",
          }}
        />
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[80vw] h-[60vh] bg-white/[0.02] rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[60vw] h-[60vh] bg-white/[0.02] rounded-full blur-[100px] mix-blend-screen" />
        {/* Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-screen" 
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="glass-panel p-10 md:p-16 flex flex-col items-center max-w-lg w-full relative overflow-hidden group">
          
          {/* Subtle hover flare */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-tr from-white/[0.01] via-white/[0.04] to-transparent pointer-events-none" />

          {/* Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-50 animate-pulse" />
            <Ghost className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] relative z-10" />
          </div>

          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-sm mb-2">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Página no encontrada
          </h2>
          
          <p className="text-muted-foreground mb-8 max-w-xs text-balance">
            Parece que te has perdido en el vacío. La página que buscas no existe o ha sido movida.
          </p>

          <Link href="/">
            <Button size="lg" className="rounded-full font-semibold bg-white text-[#18181B] hover:bg-gray-200 transition-all shadow-md px-6 group/btn">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover/btn:-translate-x-1 transition-transform" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
