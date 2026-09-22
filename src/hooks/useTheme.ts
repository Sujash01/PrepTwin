import { useContext } from 'react'
import { ThemeContext } from '../theme/theme'
import type { ThemeContextValue } from '../theme/theme'

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}