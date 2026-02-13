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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between">
        {/* Left side - Logo and Navegation */}
        <div className="flex items-center gap-8 pl-16">
          <Link href="/dashboard" className="flex items-center gap-1 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]">
            <Image src="/logo.png" alt="Tempo" width={50} height={50} className="transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"/>
            <span className="font-bold text-xl drop-shadow-lg">
              Tempo
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium transition-all hover:text-primary drop-shadow-lg hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              Inicio
            </Link>
            <Link href="/dashboard/calendario" className="text-sm font-medium transition-colors hover:text-primary drop-shadow-lg hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              Calendario
            </Link>
          </nav>
        </div>

        {/* Right side - Notifications, Music and User Menu */}
        <div className="flex items-center gap-4 pr-16">
          <MusicButton />
            <NotificationsPanel userId={userId} />
          <UserMenu fullName={fullName} />
        </div>
      </div>
    </header>
  )
}
