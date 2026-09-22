import { createContext } from 'react'

export type Theme = 'dark' | 'light'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const STORAGE_KEY = 'preptwin-theme'

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}