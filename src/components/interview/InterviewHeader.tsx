import { Brain, Clock, LogOut, BarChart3 } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { Button } from '../ui/Button'

interface InterviewHeaderProps {
  questionLabel: string
  elapsed: number
  onExit: () => void
  onToggleInsights: () => void
  insightsOpen: boolean
  className?: string
}

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
}

export function InterviewHeader({
  questionLabel,
  elapsed,
  onExit,
  onToggleInsights,
  insightsOpen,
  className,
}: InterviewHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-30 border-b border-surface-700/50 bg-surface-950/70 backdrop-blur-xl', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="font-bold text-surface-100 text-sm">PrepTwin</p>
            <p className="text-[11px] text-surface-500 font-medium tracking-wide">AI Interview</p>
          </div>
        </div>

        <p className="hidden md:block text-sm font-semibold text-surface-300">
          Question <span className="text-primary-400">{questionLabel}</span>
        </p>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-sm text-surface-300 bg-surface-800/60 border border-surface-700 rounded-lg px-2.5 py-1.5">
            <Clock className="w-3.5 h-3.5 text-surface-500" aria-hidden="true" />
            {formatTime(elapsed)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleInsights}
            aria-label={insightsOpen ? 'Hide interview insights' : 'Show interview insights'}
            aria-pressed={insightsOpen}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span className="hidden sm:inline">Exit Interview</span>
          </Button>
        </div>
      </div>
    </header>
  )
}