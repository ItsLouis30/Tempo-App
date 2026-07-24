"use client"

import React, { useState, useEffect } from "react"
import { Quote } from "lucide-react"

const QUOTES = [
  "La simplicidad es la máxima sofisticación.",
  "Concéntrate en ser productivo, no en estar ocupado.",
  "Tu mente es para tener ideas, no para retenerlas.",
  "El secreto de salir adelante es empezar.",
  "Lo que haces hoy puede mejorar todos tus mañanas.",
  "Una tarea a la vez.",
  "El progreso es mejor que la perfección.",
  "La disciplina supera a la motivación.",
  "Haz primero lo importante.",
  "Pequeños avances diarios crean grandes resultados.",
  "Menos distracciones. Más enfoque.",
  "La claridad reduce el estrés.",
  "El tiempo es tu recurso más valioso.",
  "Empieza antes de sentirte listo.",
  "Lo importante rara vez es urgente.",
  "El enfoque es decir no a cien buenas ideas.",
  "No necesitas hacer más. Necesitas priorizar mejor.",
  "Las grandes metas se alcanzan completando pequeñas tareas.",
  "Cada tarea terminada es un paso hacia adelante.",
  "Construye hábitos que trabajen por ti."
];

export function DailyQuote() {
  const [quote, setQuote] = useState("")

  useEffect(() => {
    // Pick a quote based on the current day of the year so it changes daily, 
    // or just random on mount. Let's do random on mount for a fresh feel every time they load.
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    setQuote(randomQuote)
  }, [])

  if (!quote) return null

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center opacity-60 hover:opacity-100 transition-opacity duration-500">
      <Quote className="w-6 h-6 text-white/30 mb-3" />
      <p className="text-sm italic text-white font-serif tracking-wide leading-relaxed">
        "{quote}"
      </p>
    </div>
  )
}
