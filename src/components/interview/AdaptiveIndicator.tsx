import { TrendingUp, TrendingDown, Minus, Target, Brain } from 'lucide-react'
import { cn } from '../../utils/helpers'
import type { AdaptiveIndicator as AdaptiveIndicatorType } from '../../utils/types'

interface AdaptiveIndicatorProps {
  data: AdaptiveIndicatorType
  className?: string
}

const PERFORMANCE_LABELS = {
  'excellent': 'Excellent',
  'good': 'Good',
  'average': 'Average',
  'below-average': 'Below Average',
}

const TECHNICAL_LABELS = {
  'strong': 'Strong',
  'moderate': 'Moderate',
  'developing': 'Developing',
}

const NEXT_LABELS = {
  'increasing': 'Increasing ↑',
  'maintaining': 'Maintaining',
  'decreasing': 'Decreasing ↓',
}

export function AdaptiveIndicator({ data, className }: AdaptiveIndicatorProps) {
  const performanceColors = {
    'excellent': 'text-green-400',
    'good': 'text-primary-400',
    'average': 'text-amber-400',
    'below-average': 'text-red-400',
  }

  const technicalColors = {
    'strong': 'text-green-400',
    'moderate': 'text-amber-400',
    'developing': 'text-red-400',
  }

  const nextColors = {
    'increasing': 'text-green-400',
    'maintaining': 'text-primary-400',
    'decreasing': 'text-amber-400',
  }

  const NextIcon = {
    'increasing': TrendingUp,
    'maintaining': Minus,
    'decreasing': TrendingDown,
  }[data.nextDifficulty]

  return (
    <div className={cn('rounded-2xl border border-primary-500/30 bg-primary-500/10 backdrop-blur-xl p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-surface-100">Interview Adaptation</h3>
        </div>
        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wider bg-surface-800/50 px-2 py-1 rounded">
          Live
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-400">Previous performance</span>
          <span className={cn('text-sm font-semibold', performanceColors[data.previousPerformance])}>
            {PERFORMANCE_LABELS[data.previousPerformance]}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-400">Technical understanding</span>
          <span className={cn('text-sm font-semibold', technicalColors[data.technicalUnderstanding])}>
            {TECHNICAL_LABELS[data.technicalUnderstanding]}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-400">Next difficulty</span>
          <span className={cn('text-sm font-semibold flex items-center gap-1.5', nextColors[data.nextDifficulty])}>
            <NextIcon className="w-4 h-4" />
            {NEXT_LABELS[data.nextDifficulty]}
          </span>
        </div>

        <div className="pt-3 border-t border-primary-500/20">
          <div className="flex items-start gap-2">
            <Brain className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
            <p className="text-xs text-surface-300 leading-relaxed">{data.reason}</p>
          </div>
        </div>
      </div>
    </div>
  )
}