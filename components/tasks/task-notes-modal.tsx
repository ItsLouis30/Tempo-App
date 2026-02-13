"use client"

import { useState } from "react"
import { Plus, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/client"
import useSWR, { mutate } from "swr"

interface TaskNote {
  id: string
  task_id: string
  user_id: string
  content: string
  position: number
  created_at: string
}

interface TaskNotesModalProps {
  taskId: string
  userId: string
  isOpen: boolean
  onClose: () => void
}

export function TaskNotesModal({
  taskId,
  userId,
  isOpen,
  onClose,
}: TaskNotesModalProps) {
  const [newNoteContent, setNewNoteContent] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isInputVisible, setIsInputVisible] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const supabase = createClient() // Use createBrowserClient here

  const { data: notes = [] } = useSWR<TaskNote[]>(
    isOpen ? ["task-notes", taskId] : null,
    async () => {
      const { data, error } = await supabase
        .from("task_notes")
        .select("*")
        .eq("task_id", taskId)
        .order("position", { ascending: true })

      if (error) throw error
      return data || []
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  const addNote = async () => {
    if (!newNoteContent.trim()) return

    setIsAdding(true)
    try {
      const maxPosData = await supabase
        .from("task_notes")
        .select("position")
        .eq("task_id", taskId)
        .order("position", { ascending: false })
        .limit(1)

      const newPosition =
        maxPosData.data && maxPosData.data.length > 0
          ? parseFloat((maxPosData.data[0].position + 1).toFixed(1))
          : 1.0

      const { error } = await supabase.from("task_notes").insert({
        task_id: taskId,
        user_id: userId,
        content: newNoteContent,
        position: newPosition,
      })

      if (error) throw error
      setNewNoteContent("")
      mutate(["task-notes", taskId])
    } finally {
      setIsAdding(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    const { error } = await supabase
      .from("task_notes")
      .delete()
      .eq("id", noteId)
      .eq("user_id", userId)

    if (error) throw error
    mutate(["task-notes", taskId])
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      return
    }

    const newNotes = [...notes]
    const [draggedNote] = newNotes.splice(draggedIndex, 1)
    newNotes.splice(targetIndex, 0, draggedNote)

    const updates = newNotes.map((note, index) => ({
      id: note.id,
      position: parseFloat((index + 1).toFixed(1)),
    }))

    for (const update of updates) {
      await supabase
        .from("task_notes")
        .update({ position: update.position })
        .eq("id", update.id)
        .eq("user_id", userId)
    }

    setDraggedIndex(null)
    mutate(["task-notes", taskId])
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Lima"
    }
    return date.toLocaleString("es-PE", options)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-[#3A3A3A] rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground drop-shadow-lg">
            Anotaciones
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Note Button */}
        {!isInputVisible && (
          <Button
            onClick={() => setIsInputVisible(true)}
            className="bg-[hsl(var(--notes))] hover:bg-[#7A6A53] text-foreground mb-4 w-fit shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2 " />
            Añadir anotación
          </Button>
        )}

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {notes.map((note, index) => (
            <div
              key={note.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`p-3 rounded-lg border shadow-lg transition-all cursor-move group ${
                draggedIndex === index
                  ? "bg-[#3A3A3A] border-[#6B5B44] opacity-50"
                  : "bg-[#D4D3B1] border-[#E6CF7A] hover:border-[#D4B896]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[#4A4A4A] text-sm flex-1 break-words drop-shadow-sm">
                  {note.content}
                </p>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-[#8B7355] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  aria-label="Eliminar nota"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#9B8B70] mt-1">
                {formatDate(note.created_at)}
              </p>
            </div>
          ))}
        </div>

        {/* Input Area */}
        {isInputVisible && (
          <div className="border-t border-[#3A3A3A] pt-4">
            <input
              data-notes-input
              type="text"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isAdding) {
                  addNote()
                }
              }}
              placeholder="Escriba aquí..."
              className="w-full bg-[hsl(var(--inputurl))] border border-[#3A3A3A] rounded px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6B5B44] text-sm"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <Button
                onClick={addNote}
                disabled={isAdding || !newNoteContent.trim()}
                className="flex-1 bg-[#6B5B44] hover:bg-[#7A6A53] disabled:opacity-50"
              >
                {isAdding ? "Guardando..." : "Guardar nota"}
              </Button>
              <Button
                onClick={() => {
                  setIsInputVisible(false)
                  setNewNoteContent("")
                }}
                variant="outline"
                className="px-4 border-[#3A3A3A] hover:bg-[#2A2A2A]"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
