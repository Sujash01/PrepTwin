import { cn } from '../../utils/helpers'
import { Button } from './Button'
import type { TwinInsight, Recommendation } from '../../utils/types'

interface InsightCardProps {
  insight: TwinInsight
  className?: string
}

const insightStyles = {
  strength: 'border-green-500/30 bg-green-500/10',
  weakness: 'border-red-500/30 bg-red-500/10',
  pattern: 'border-amber-500/30 bg-amber-500/10',
  recommendation: 'border-primary-500/30 bg-primary-500/10',
}

const insightIcons = {
  strength: (
    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  weakness: (
    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  pattern: (
    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  recommendation: (
    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const insightLabels = {
  strength: 'Strength',
  weakness: 'Area to Improve',
  pattern: 'Pattern Detected',
  recommendation: 'Recommendation',
}

const priorityColors = {
  high: 'bg-red-500/20 text-red-300 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  low: 'bg-green-500/20 text-green-300 border-green-500/30',
}

export function InsightCard({ insight, className }: InsightCardProps) {
  return (
    <div
      className={cn(
        'card p-5 border-l-4 transition-all duration-300',
        insightStyles[insight.type],
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-surface-800/50">
          {insightIcons[insight.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-surface-100">{insightLabels[insight.type]}</span>
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', priorityColors[insight.priority])}>
              {insight.priority} priority
            </span>
          </div>
          <h4 className="text-base font-medium text-surface-100 mb-1">{insight.title}</h4>
          <p className="text-sm text-surface-400 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: Recommendation
  onPractice?: () => void
  className?: string
}

export function RecommendationCard({ recommendation, onPractice, className }: RecommendationCardProps) {
  return (
    <div className={cn('card-hover p-5 flex flex-col', className)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-semibold text-surface-100">{recommendation.topic}</h4>
          <span className={cn('mt-1 px-2 py-0.5 rounded text-xs font-medium border', priorityColors[recommendation.priority])}>
            {recommendation.priority} priority
          </span>
        </div>
      </div>
      <p className="text-sm text-surface-400 mb-4 flex-1">{recommendation.reason}</p>
      {onPractice && (
        <Button variant="primary" size="sm" onClick={onPractice} className="w-full">
          Practice Now
        </Button>
      )}
    </div>
  )
}