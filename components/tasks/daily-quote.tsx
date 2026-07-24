"use client"

import React, { useState, useEffect } from "react"
import { Quote } from "lucide-react"

const QUOTES = [
  "La simplicidad es la máxima sofisticación.",
  "Hazlo, y si tienes miedo, hazlo con miedo.",
  "Concéntrate en ser productivo, no en estar ocupado.",
  "El secreto de salir adelante es empezar.",
  "Tu mente es para tener ideas, no para retenerlas.",
  "No busques el momento perfecto, solo busca el momento y hazlo perfecto.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "Lo que haces hoy puede mejorar todos tus mañanas.",
  "Si pasas demasiado tiempo pensando en algo, nunca lo harás."
]

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
