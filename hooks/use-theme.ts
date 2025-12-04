"use client"

import { useState, useEffect } from "react"

export function useTheme() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("pixsoft-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev
      if (newValue) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("pixsoft-theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("pixsoft-theme", "light")
      }
      return newValue
    })
  }

  return { isDark, toggleTheme, mounted }
}
