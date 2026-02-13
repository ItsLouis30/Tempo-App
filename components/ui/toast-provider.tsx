"use client"

import * as React from "react"
import * as Toast from "@radix-ui/react-toast"

type ToastContextType = {
  showToast: (title: string, description?: string) => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState<string | undefined>()

  function showToast(t: string, d?: string) {
    setTitle(t)
    setDescription(d)
    setOpen(false) // reset
    requestAnimationFrame(() => setOpen(true))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}

        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className="fixed bottom-6 right-6 w-80 rounded-xl border border-zinc-700 bg-[hsl(var(--cardsound))] text-foreground p-4 shadow-2xl animate-in slide-in-from-top-2 fade-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:fade-out"
        >
          <Toast.Title className="font-semibold">
            {title}
          </Toast.Title>
          {description && (
            <Toast.Description className="text-sm opacity-80">
              {description}
            </Toast.Description>
          )}
        </Toast.Root>

        <Toast.Viewport />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useRadixToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useRadixToast must be used within ToastProvider")
  return ctx
}
