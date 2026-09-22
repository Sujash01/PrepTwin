import { cn } from '../../utils/helpers'

interface StrengthWeaknessProps {
  label: string
  items: string[]
  variant: 'strength' | 'weakness' | 'neutral'
  className?: string
}

export function StrengthWeaknessList({ label, items, variant, className }: StrengthWeaknessProps) {
  const iconStyles = {
    strength: 'bg-green-500/20 text-green-400 border-green-500/30',
    weakness: 'bg-red-500/20 text-red-400 border-red-500/30',
    neutral: 'bg-surface-700 text-surface-400 border-surface-600',
  }

  const labelStyles = {
    strength: 'text-green-400',
    weakness: 'text-red-400',
    neutral: 'text-surface-300',
  }

  const getIcon = (variant: string) => {
    if (variant === 'strength') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    if (variant === 'weakness') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-surface-700/50 bg-surface-900/50 backdrop-blur-xl p-6', className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', iconStyles[variant])}>
          {getIcon(variant)}
        </div>
        <h3 className={cn('text-lg font-semibold', labelStyles[variant])}>{label}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-surface-300">
            <span className={cn(
              'w-1.5 h-1.5 mt-1.5 rounded-full shrink-0',
              variant === 'strength' ? 'bg-green-400' : variant === 'weakness' ? 'bg-red-400' : 'bg-surface-500'
            )} />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}