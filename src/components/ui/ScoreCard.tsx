import { cn } from '../../utils/helpers'
import { CircularProgress } from './ProgressBar'

interface ScoreCardProps {
  label: string
  score: number
  max?: number
  description?: string
  trend?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreCard({ label, score, max = 10, description, trend, className, size = 'md' }: ScoreCardProps) {
  const percentage = (score / max) * 100
  const getColor = (score: number) => {
    if (score >= 8) return 'success'
    if (score >= 6) return 'warning'
    return 'danger'
  }

  const sizes = {
    sm: { card: 'p-4', circle: 'sm' as const, label: 'text-sm', value: 'text-2xl', desc: 'text-xs' },
    md: { card: 'p-5', circle: 'md' as const, label: 'text-base', value: 'text-3xl', desc: 'text-sm' },
    lg: { card: 'p-6', circle: 'lg' as const, label: 'text-lg', value: 'text-4xl', desc: 'text-base' },
  }

  const s = sizes[size]

  return (
    <div className={cn('card-hover text-center', s.card, className)}>
      <div className="mx-auto mb-3">
        <CircularProgress
          value={percentage}
          size={s.circle}
          strokeWidth={size === 'sm' ? 4 : size === 'md' ? 5 : 6}
          variant={getColor(percentage)}
          showValue={false}
        >
          <span className={cn('font-bold text-surface-100', s.value)}>
            {score.toFixed(1)}<span className="text-surface-500 font-normal">{size !== 'sm' ? ` / ${max}` : ''}</span>
          </span>
        </CircularProgress>
      </div>
      <h3 className={cn('font-semibold text-surface-100', s.label)}>{label}</h3>
      {description && <p className={cn('text-surface-400 mt-1', s.desc)}>{description}</p>}
      {trend !== undefined && (
        <div className={cn('mt-2 flex items-center justify-center gap-1', s.desc)}>
          <span className={cn(trend >= 0 ? 'text-green-400' : 'text-red-400')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}
          </span>
          <span className="text-surface-500">vs previous</span>
        </div>
      )}
    </div>
  )
}

interface ScoreGridProps {
  scores: Array<{ label: string; score: number; description?: string; max?: number; trend?: number }>
  columns?: 2 | 3 | 4 | 5
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ScoreGrid({ scores, columns = 3, size = 'md', className }: ScoreGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {scores.map((score, index) => (
        <ScoreCard key={index} size={size} {...score} />
      ))}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: number
  trendLabel?: string
  className?: string
}

export function MetricCard({ label, value, icon, trend, trendLabel, className }: MetricCardProps) {
  return (
    <div className={cn('card-hover p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-surface-100">{value}</p>
        </div>
        {icon && <div className="text-surface-500">{icon}</div>}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span className={cn(trend >= 0 ? 'text-green-400' : 'text-red-400')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}
          </span>
          <span className="text-surface-500">{trendLabel || 'vs previous'}</span>
        </div>
      )}
    </div>
  )
}