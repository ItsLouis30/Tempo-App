import type React from "react"
import { MainHeader } from "@/components/header/main-header"
import { MusicProvider } from "@/components/music/music-provider"
import { DashboardContent } from "@/components/dashboard-content"
import { Suspense } from "react"
import { ToastProvider } from "@/components/ui/toast-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <MusicProvider>
          <div className="min-h-screen bg-[#1F1F1F]">
            <Suspense fallback={<HeaderSkeleton />}>
              <MainHeader />
              <DashboardContent>{children}</DashboardContent>
            </Suspense>
          </div>
      </MusicProvider>
    </ToastProvider>
  )
}

function HeaderSkeleton() {
  return (
    <div className="h-16 border-b bg-background animate-pulse" />
  )
}
