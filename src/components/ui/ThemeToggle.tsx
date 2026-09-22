import { Moon, Sun } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'
  const Icon = isDark ? Sun : Moon

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center p-2 rounded-xl text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 border border-transparent hover:border-surface-700 transition-colors duration-200',
        className
      )}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}