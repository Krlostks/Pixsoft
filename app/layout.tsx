import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "PixSoft - Tecnología Premium",
  description: "Tu destino para hardware, computadoras, laptops y más. Calidad premium al mejor precio.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <Header />
      <body className={`${inter.className} font-sans antialiased`}>{children}</body>
      <Footer />
    </html>
  )
}
