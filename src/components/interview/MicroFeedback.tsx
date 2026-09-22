import { CheckCircle } from 'lucide-react'
import { cn } from '../../utils/helpers'
import type { MicroFeedback as MicroFeedbackType } from '../../utils/types'

interface MicroFeedbackProps {
  feedback: MicroFeedbackType
  className?: string
}

const METRICS: Array<{ key: keyof MicroFeedbackType; label: string }> = [
  { key: 'technical', label: 'Technical' },
  { key: 'relevance', label: 'Relevance' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'structure', label: 'Structure' },
  { key: 'confidence', label: 'Confidence' },
]

function getBarColor(score: number): string {
  if (score >= 8) return 'from-green-500 to-green-400'
  if (score >= 6) return 'from-amber-500 to-amber-400'
  return 'from-red-500 to-red-400'
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-400'
  if (score >= 6) return 'text-amber-400'
  return 'text-red-400'
}

export function MicroFeedback({ feedback, className }: MicroFeedbackProps) {
  return (
    <div className={cn('rounded-2xl border border-surface-700/50 bg-surface-900/50 backdrop-blur-xl p-5 animate-fade-in', className)}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <h3 className="text-sm font-semibold text-surface-100">Answer Analyzed</h3>
      </div>

      <div className="space-y-3">
        {METRICS.map(metric => {
          const score = feedback[metric.key]
          return (
            <div key={metric.key} className="flex items-center gap-3">
              <span className="w-20 text-xs text-surface-400 shrink-0">{metric.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-surface-700/50 overflow-hidden">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out', getBarColor(score))}
                  style={{ width: `${(score / 10) * 100}%` }}
                />
              </div>
              <span className={cn('w-12 text-right font-mono text-sm font-semibold shrink-0', getScoreColor(score))}>
                {score}/10
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-surface-700/50">
        <p className="text-[10px] text-surface-500">
          This is a moment-by-moment coaching estimate. Full breakdown available in your results report.
        </p>
      </div>
    </div>
  )
}