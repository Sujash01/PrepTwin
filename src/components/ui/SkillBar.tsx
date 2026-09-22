import { cn } from '../../utils/helpers'

interface SkillBarProps {
  name: string
  score: number
  max?: number
  showScore?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
  animated?: boolean
  className?: string
}

export function SkillBar({ name, score, max = 100, showScore = true, size = 'md', variant = 'default', animated = true, className }: SkillBarProps) {
  const percentage = Math.min(Math.max((score / max) * 100, 0), 100)

  const variants = {
    default: 'bg-gradient-to-r from-primary-500 to-primary-400',
    success: 'bg-gradient-to-r from-green-500 to-green-400',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-400',
    danger: 'bg-gradient-to-r from-red-500 to-red-400',
    primary: 'bg-gradient-to-r from-primary-500 to-primary-400',
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between mb-1.5">
        <span className={cn('font-medium text-surface-200', labelSizes[size])}>{name}</span>
        {showScore && (
          <span className={cn('font-mono text-surface-400', labelSizes[size])}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className={cn('relative rounded-full bg-surface-700/50 overflow-hidden', heights[size])}>
        <div
          className={cn(
            'rounded-full transition-all duration-1000 ease-out',
            variants[variant],
            animated && 'animate-gradient'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${name}: ${Math.round(percentage)}%`}
        />
      </div>
    </div>
  )
}

interface SkillChipProps {
  name: string
  proficiency?: number
  removable?: boolean
  onRemove?: () => void
  onClick?: () => void
  variant?: 'default' | 'selected' | 'suggested'
  className?: string
}

export function SkillChip({ name, proficiency, removable, onRemove, onClick, variant = 'default', className }: SkillChipProps) {
  const variants = {
    default: 'bg-surface-800 border-surface-700 text-surface-200 hover:bg-surface-700',
    selected: 'bg-primary-500/20 border-primary-500/30 text-primary-300',
    suggested: 'bg-surface-700 border-surface-600 text-surface-300 hover:bg-surface-600 hover:border-primary-500/50 hover:text-primary-300 cursor-pointer',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200',
      variants[variant],
      onClick && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50',
      className
    )}
      onClick={onClick}
      onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {name}
      {proficiency !== undefined && (
        <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-surface-900/50 text-surface-400">
          {proficiency}%
        </span>
      )}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 rounded hover:bg-white/10 transition-colors"
          aria-label={`Remove ${name}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

interface SkillCategoryBarProps {
  name: string
  score: number
  skills: Array<{ name: string; proficiency: number }>
  className?: string
}

export function SkillCategoryBar({ name, score, skills, className }: SkillCategoryBarProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-surface-100">{name}</h4>
        <span className="text-lg font-bold text-primary-400">{score}%</span>
      </div>
      <SkillBar name={name} score={score} size="lg" />
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <SkillChip
            key={skill.name}
            name={skill.name}
            proficiency={skill.proficiency}
            variant="selected"
          />
        ))}
      </div>
    </div>
  )
}