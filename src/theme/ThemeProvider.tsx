import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, applyTheme, getInitialTheme, STORAGE_KEY } from './theme'
import type { Theme, ThemeContextValue } from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Storage unavailable — theme still applies for the current session.
    }
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark')),
      setTheme,
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}