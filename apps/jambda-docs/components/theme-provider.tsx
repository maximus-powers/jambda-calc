"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Add a debug log to check if theme changes are detected
  React.useEffect(() => {
    const handleThemeChange = () => {
      console.log("Theme changed:", document.documentElement.classList.contains("dark") ? "dark" : "light")
    }

    // Listen for class changes on the html element
    const observer = new MutationObserver(handleThemeChange)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [mounted])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
