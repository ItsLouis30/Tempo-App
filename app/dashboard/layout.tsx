import type React from "react"
import { MainHeader } from "@/components/header/main-header"
import { MusicProvider } from "@/components/music/music-provider"
import { DashboardContent } from "@/components/dashboard-content"
import { Suspense } from "react"
import { ToastProvider } from "@/components/ui/toast-provider"
import { AuthListener } from "@/components/auth-listener"
import { ThemeProvider } from "@/components/theme/theme-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <AuthListener />
      <ThemeProvider>
        <MusicProvider>
          <div className="relative min-h-screen text-foreground selection:bg-white/20 isolate">
            {/* Layer 0: Background Gradient (Theme Engine) */}
            <div 
              className="fixed inset-0 z-[-2]"
              style={{
                background: "linear-gradient(135deg, rgba(var(--theme-bg-start), 0.9) 0%, rgba(var(--theme-bg-end), 1) 100%)",
                backgroundColor: "rgb(var(--theme-bg-end))"
              }}
            />
            
            {/* Layer 1: Overlay (Theme Engine for legibility) */}
            <div 
              className="fixed inset-0 z-[-1] transition-colors duration-300 pointer-events-none" 
              style={{ backgroundColor: "rgba(0, 0, 0, var(--theme-overlay-opacity, 0.08))" }}
            />
            
            {/* Layer 2: Content */}
            <Suspense fallback={<HeaderSkeleton />}>
              <MainHeader />
              <DashboardContent>{children}</DashboardContent>
            </Suspense>
          </div>
        </MusicProvider>
      </ThemeProvider>
    </ToastProvider>
  )
}

function HeaderSkeleton() {
  return (
    <div className="h-16 border-b bg-background animate-pulse" />
  )
}
