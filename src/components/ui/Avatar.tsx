import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/helpers'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  shape?: 'circle' | 'square'
  status?: 'online' | 'offline' | 'busy' | 'speaking'
  speaking?: boolean
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', shape = 'circle', status, speaking, ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-24 h-24 text-2xl',
    }

    const statusSizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
      '2xl': 'w-5 h-5',
    }

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-surface-500',
      busy: 'bg-red-500',
      speaking: 'bg-primary-500 animate-pulse',
    }

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const getColorFromName = (name: string) => {
      const colors = [
        'bg-primary-500',
        'bg-green-500',
        'bg-amber-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-cyan-500',
        'bg-orange-500',
        'bg-indigo-500',
      ]
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return colors[Math.abs(hash) % colors.length]
    }

    return (
      <div ref={ref} className={cn('relative inline-flex shrink-0', className)} {...props}>
        <div
          className={cn(
            'inline-flex items-center justify-center font-medium text-white overflow-hidden',
            sizes[size],
            shape === 'circle' ? 'rounded-full' : 'rounded-xl'
          )}
        >
          {src ? (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className="w-full h-full object-cover"
            />
          ) : name ? (
            <div className={cn('w-full h-full flex items-center justify-center', getColorFromName(name))}>
              {getInitials(name)}
            </div>
          ) : (
            <div className="w-full h-full bg-surface-700 flex items-center justify-center">
              <svg className="w-1/2 h-1/2 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          
          {speaking && (
            <div className="absolute inset-0 bg-primary-500/20 animate-pulse rounded-full" />
          )}
        </div>
        
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 border-2 border-surface-950 rounded-full',
              statusSizes[size],
              statusColors[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export const AIAvatar = ({ size = 'xl', speaking = false, className }: { size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl', speaking?: boolean, className?: string }) => {
  const pulseClass = speaking ? 'animate-pulse' : ''
  
  return (
    <div className={cn('relative inline-flex', className)}>
      <div className={cn('relative flex items-center justify-center bg-gradient-to-br from-primary-500/30 to-purple-500/30 rounded-full border border-primary-500/30', {
        'w-16 h-16': size === 'sm',
        'w-24 h-24': size === 'md',
        'w-32 h-32': size === 'lg',
        'w-40 h-40': size === 'xl',
        'w-48 h-48': size === '2xl',
      })}>
        <div className={cn('absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full', pulseClass)} />
        <div className={cn('absolute inset-2 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full', pulseClass)} />
        <svg className="relative z-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '60%', height: '60%' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      {speaking && (
        <div className="absolute -inset-1 bg-primary-500/20 rounded-full animate-ping" />
      )}
    </div>
  )
}