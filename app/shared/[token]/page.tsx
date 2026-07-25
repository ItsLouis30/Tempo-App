import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SharedBoardClient } from "@/components/shared-board/shared-board-client"
import { Suspense } from "react"

async function SharedBoardContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Call the Security Definer RPC function to get the board data
  const { data, error } = await supabase.rpc("get_shared_board_data", {
    p_token: token,
  })

  if (error || !data) {
    console.error("Error fetching shared board:", error)
    notFound()
  }

  // The RPC returns a JSON object with profile, tasks, tags, task_tags
  const { profile, tasks, tags, task_tags } = data as any

  if (!profile) {
    notFound()
  }

  return (
    <div className={`min-h-screen theme-${profile.theme || 'midnight'} relative bg-[#0a0a0a]`}>
      {/* Background Gradient matching the user's theme */}
      <div 
        className="fixed inset-0 z-0 transition-colors duration-1000"
        style={{
          background: "linear-gradient(135deg, rgba(var(--theme-bg-start), 0.9) 0%, rgba(var(--theme-bg-end), 1) 100%)",
          backgroundColor: "rgb(var(--theme-bg-end))"
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-6 md:px-12">
          <div className="flex h-14 items-center justify-between relative w-full">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center gap-2 group hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] transition-all">
                <img src="/logo.png" alt="Tempo" width={36} height={36} className="transition-transform duration-300 ease-out group-hover:scale-110" />
                <span className="font-bold text-lg drop-shadow-md text-white tracking-wide">
                  Tempo
                </span>
              </a>
            </div>

            {/* Center - Name badge */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
              <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full transition-all text-sm font-medium text-white/90">
                Tablero de {profile.full_name?.split(' ')[0] || 'Usuario'}
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="flex items-center gap-4">
              <a href="/" className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all hover:scale-[1.02] border border-white/10 backdrop-blur-md">
                Crear mi cuenta
              </a>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
          <div className="max-w-[1400px] mx-auto w-full glass-panel p-6 md:p-8 flex-1">
            <SharedBoardClient 
              profile={profile} 
              tasks={tasks || []} 
              tags={tags || []} 
              taskTags={task_tags || []} 
            />
          </div>
        </div>
        
        {/* Footer CTA */}
        <footer className="w-full text-center py-6 text-white/50 text-sm mt-auto">
          ¿Te gusta cómo se ve esto? <a href="/" className="text-white/80 hover:text-white underline underline-offset-2">Regístrate en Tempo</a> para usar cronómetros, analíticas y música.
        </footer>
      </div>
    </div>
  )
}

export default async function SharedBoardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/70">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <SharedBoardContent params={params} />
    </Suspense>
  )
}
