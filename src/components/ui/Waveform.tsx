import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/helpers'

interface WaveformProps {
  active: boolean
  className?: string
  barCount?: number
  color?: string
  height?: number
}

export function Waveform({ active, className, barCount = 20, color = 'primary-400', height = 60 }: WaveformProps) {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.1))
  const animationRef = useRef<number | null>(null)
  const colors = {
    'primary-400': 'text-primary-400',
    'green-400': 'text-green-400',
    'red-400': 'text-red-400',
    'amber-400': 'text-amber-400',
  }

  useEffect(() => {
    if (!active) {
      setBars(Array(barCount).fill(0.1))
      return
    }

    const animate = () => {
      setBars(prev => prev.map(() => Math.random() * 0.8 + 0.2))
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [active, barCount])

  return (
    <div
      className={cn('flex items-end justify-center gap-1', className)}
      style={{ height }}
      aria-hidden="true"
    >
      {bars.map((barHeight, index) => (
        <div
          key={index}
          className={cn(
            'rounded transition-all duration-100',
            colors[color as keyof typeof colors] || 'text-primary-400'
          )}
          style={{
            width: '4px',
            height: `${barHeight * 100}%`,
            minHeight: '4px',
          }}
        />
      ))}
    </div>
  )
}

interface VoiceButtonProps {
  state: 'idle' | 'listening' | 'processing' | 'completed'
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function VoiceButton({ state, onClick, disabled, className }: VoiceButtonProps) {
  const colors = {
    idle: 'bg-surface-800 border-surface-700 hover:bg-surface-700 text-surface-100',
    listening: 'bg-red-500/20 border-red-500 animate-pulse text-red-400',
    processing: 'bg-primary-500/20 border-primary-500 text-primary-400',
    completed: 'bg-green-500/20 border-green-500 text-green-400',
  }

  const icons = {
    idle: <Mic className="w-8 h-8" />,
    listening: <Mic className="w-8 h-8" />,
    processing: <Loader className="w-8 h-8 animate-spin" />,
    completed: <Check className="w-8 h-8" />,
  }

  const labels = {
    idle: 'Click to speak',
    listening: 'Listening...',
    processing: 'Processing...',
    completed: 'Answer received',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || state === 'processing'}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-950',
        colors[state],
        className
      )}
      aria-label={labels[state]}
      aria-pressed={state === 'listening'}
    >
      <div className="relative">
        {icons[state]}
        {state === 'listening' && (
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
        )}
        {state === 'processing' && (
          <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" />
        )}
      </div>
      <span className="text-sm font-medium">{labels[state]}</span>
      {state === 'listening' && (
        <Waveform active={true} barCount={12} color="red-400" height={30} />
      )}
    </button>
  )
}

function Mic({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function Loader({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}