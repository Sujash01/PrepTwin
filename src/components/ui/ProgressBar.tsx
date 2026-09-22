import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/helpers'

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
  animated?: boolean
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, showLabel = false, size = 'md', variant = 'default', animated = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const variants = {
      default: 'bg-primary-500',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      primary: 'bg-primary-500',
    }

    const sizes = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    }

    const labelSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    }

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className={cn('relative rounded-full bg-surface-700/50 overflow-hidden', sizes[size])}>
          <div
            className={cn(
              'rounded-full transition-all duration-500 ease-out',
              variants[variant],
              animated && 'animate-pulse-slow'
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
        {showLabel && (
          <div className={cn('flex justify-between mt-1', labelSizes[size])}>
            <span className="text-surface-400">{Math.round(percentage)}%</span>
            <span className="text-surface-500">{value}/{max}</span>
          </div>
        )}
      </div>
    )
  }
)

ProgressBar.displayName = 'ProgressBar'

export const CircularProgress = forwardRef<HTMLDivElement, {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
  showValue?: boolean
  className?: string
  children?: React.ReactNode
}>(
  ({ className, value, max = 100, size = 'md', strokeWidth = 6, variant = 'default', showValue = true, children, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = 50 - strokeWidth
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    const sizes = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32',
      xl: 'w-40 h-40',
    }

    const variants = {
      default: 'text-primary-500',
      primary: 'text-primary-500',
      success: 'text-green-500',
      warning: 'text-amber-500',
      danger: 'text-red-500',
    }

    return (
      <div ref={ref} className={cn('relative inline-flex items-center justify-center', sizes[size], className)} {...props}>
        <svg className="transform -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-surface-700"
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
          />
          <circle
            className={cn('transition-all duration-1000 ease-out', variants[variant])}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {showValue ? (
            <span className="font-bold text-surface-100">{Math.round(percentage)}%</span>
          ) : (
            children
          )}
        </div>
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'