import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell } from "lucide-react"
import { UserMenu } from "@/components/header/user-menu"
import { MusicButton } from "@/components/music/music-button"
import Image from "next/image" 
import { NotificationsPanel } from "@/components/notifications/notifications-panel"

async function getHeaderData() {
  
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  const fullName = profile?.full_name || "Usuario"
  
  return { fullName, userId: user.id }
}

export async function MainHeader() {
  const { fullName, userId } = await getHeaderData()

  return (
    <header className="sticky top-0 z-50 w-full pt-4">
      <div className="flex h-14 items-center justify-between px-6 md:px-12 relative w-full">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] transition-all">
            <Image src="/logo.png" alt="Tempo" width={36} height={36} className="transition-transform duration-300 ease-out group-hover:scale-110" />
            <span className="font-bold text-lg drop-shadow-md text-white tracking-wide">
              Tempo
            </span>
          </Link>
        </div>

        {/* Center - Navigation (Floating Pill) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <nav className="flex items-center gap-1 bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium px-5 py-1.5 rounded-full bg-white text-black shadow-sm transition-all"
            >
              Inicio
            </Link>
            <Link 
              href="/dashboard/calendario" 
              className="text-sm font-medium px-5 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              Calendario
            </Link>
          </nav>
        </div>

        {/* Right side - Notifications, Music and User Menu */}
        <div className="flex items-center gap-4">
          <MusicButton />
          <NotificationsPanel userId={userId} />
          <UserMenu fullName={fullName} />
        </div>
      </div>
    </header>
  )
}
