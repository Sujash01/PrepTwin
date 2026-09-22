import { ProgressBar } from '../ui/ProgressBar'
import { cn } from '../../utils/helpers'

interface InterviewProgressProps {
  current: number
  answered: number
  className?: string
}

export function InterviewProgress({ current, answered, className }: InterviewProgressProps) {
  const pct = Math.min(100, Math.round((answered / 8) * 100))

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-surface-400">
        <span>
          Question <span className="text-surface-100">{current}</span>
        </span>
        <span>{answered} answered</span>
      </div>
      <ProgressBar value={pct} max={100} size="sm" variant="primary" animated />
      <p className="sr-only">Question {current}, {answered} answered</p>
    </div>
  )
}