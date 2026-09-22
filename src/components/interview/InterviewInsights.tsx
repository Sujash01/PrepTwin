import { BarChart3, Waves, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/helpers'
import type { MockDifficulty } from '../../data/mockInterview'

const DIFFICULTY_COLORS: Record<MockDifficulty, string> = {
  Easy: 'bg-green-400',
  Medium: 'bg-amber-400',
  Hard: 'bg-red-400',
}

const DIFFICULTY_TEXT: Record<MockDifficulty, string> = {
  Easy: 'text-green-300',
  Medium: 'text-amber-300',
  Hard: 'text-red-300',
}

interface DifficultyMeterProps {
  difficulty: MockDifficulty
  level: number
  className?: string
}

export function DifficultyMeter({ difficulty, level, className }: DifficultyMeterProps) {
  const segments = 8
  const filled = Math.min(segments, Math.max(0, Math.round((level / 100) * segments)))

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="img"
      aria-label={`Difficulty: ${difficulty} (${Math.round(level)} of 100)`}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={cn('flex-1 h-1.5 rounded-full transition-colors duration-300', i < filled ? DIFFICULTY_COLORS[difficulty] : 'bg-surface-700')}
        />
      ))}
    </div>
  )
}

interface AdaptiveStatusProps {
  difficulty: MockDifficulty
  level: number
  className?: string
}

export function AdaptiveStatus({ difficulty, level, className }: AdaptiveStatusProps) {
  return (
    <Card variant="glass" padding="sm" className={cn('flex items-center gap-4 animate-fade-in', className)}>
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/25 shrink-0">
        <Waves className="w-5 h-5 text-primary-400 animate-pulse" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-surface-200">PrepTwin is adapting</p>
          <span className={cn('text-xs font-medium', DIFFICULTY_TEXT[difficulty])}>{difficulty}</span>
        </div>
        <DifficultyMeter difficulty={difficulty} level={level} className="mt-2" />
      </div>
    </Card>
  )
}

interface InterviewInsightsProps {
  focus: string
  difficulty: MockDifficulty
  level: number
  trend: 'Improving' | 'Stable' | 'Developing'
  topics: string[]
  className?: string
}

const TREND_META: Record<InterviewInsightsProps['trend'], { icon: typeof TrendingUp; className: string }> = {
  Improving: { icon: TrendingUp, className: 'text-green-400' },
  Stable: { icon: Minus, className: 'text-surface-300' },
  Developing: { icon: TrendingDown, className: 'text-amber-400' },
}

export function InterviewInsights({
  focus,
  difficulty,
  level,
  trend,
  topics,
  className,
}: InterviewInsightsProps) {
  const TrendIcon = TREND_META[trend].icon

  return (
    <Card variant="glass" padding="lg" className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-surface-100">
          <BarChart3 className="w-4 h-4 text-primary-400" aria-hidden="true" />
          Interview Insights
        </h2>
        <Badge variant="primary" size="sm">Live</Badge>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-surface-500">Current focus</p>
          <p className="text-sm font-medium text-surface-100 capitalize">{focus}</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-surface-500">Difficulty</p>
          <DifficultyMeter difficulty={difficulty} level={level} />
          <p className={cn('mt-1.5 text-sm font-medium capitalize', DIFFICULTY_TEXT[difficulty])}>{difficulty}</p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-surface-500">Performance trend</p>
          <p className="flex items-center gap-1.5 text-sm font-medium text-surface-100">
            <TrendIcon className={cn('w-4 h-4', TREND_META[trend].className)} aria-hidden="true" />
            {trend}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-surface-500">Topics covered</p>
          <div className="flex flex-wrap gap-1.5">
            {topics.length > 0 ? (
              topics.map(topic => (
                <span
                  key={topic}
                  className="rounded-full bg-surface-800/70 border border-surface-700 px-2.5 py-0.5 text-xs text-surface-300"
                >
                  {topic}
                </span>
              ))
            ) : (
              <p className="text-xs text-surface-500">No topics covered yet.</p>
            )}
          </div>
          <p className="mt-2 text-xs text-surface-500">Updates as you progress through questions.</p>
        </div>
      </div>

      <p className="mt-6 pt-4 border-t border-surface-700/50 text-xs text-surface-500 leading-relaxed">
        High-level status only. Detailed scoring and your Candidate Twin stay hidden until the session ends.
      </p>
    </Card>
  )
}