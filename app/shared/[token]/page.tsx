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
      <div className="relative z-10">
        {/* Simple Header for Visitors */}
        <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-6 md:px-12 flex justify-between items-center bg-transparent backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl drop-shadow-md text-white tracking-wide">
              Tempo
            </span>
            <span className="text-white/40 text-sm">|</span>
            <span className="text-white/70 font-medium text-sm">Tablero de {profile.full_name?.split(' ')[0] || 'Usuario'}</span>
          </div>
          
          <a href="/" className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors border border-white/10 backdrop-blur-md">
            Crear mi cuenta
          </a>
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto glass-panel p-6 md:p-8 min-h-[85vh]">
            <SharedBoardClient 
              profile={profile} 
              tasks={tasks || []} 
              tags={tags || []} 
              taskTags={task_tags || []} 
            />
          </div>
        </div>
        
        {/* Footer CTA */}
        <footer className="w-full text-center py-8 text-white/50 text-sm">
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
