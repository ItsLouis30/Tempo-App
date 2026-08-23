import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Tempo - Organizador de Tareas y Productividad",
    template: "%s | Tempo"
  },
  description: "Tempo combina gestión de proyectos, técnica Pomodoro, calendario y controles de entorno (Spotify y sonidos ambientales) en una sola interfaz diseñada para el enfoque profundo.",
  keywords: ["productividad", "organizador", "tareas", "pomodoro", "calendario", "todo list", "gestión de tiempo", "focus", "estudio"],
  authors: [{ name: "ItsLouis30", url: "https://github.com/ItsLouis30" }],
  creator: "ItsLouis30",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: defaultUrl,
    title: "Tempo - Organizador de Tareas y Productividad",
    description: "Un entorno unificado para gestionar tareas, controlar tiempos y organizar tu día con enfoque profundo.",
    siteName: "Tempo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tempo - Organizador de Tareas y Productividad",
    description: "Un entorno unificado para gestionar tareas, controlar tiempos y organizar tu día con enfoque profundo.",
    creator: "@ItsLouis30",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
