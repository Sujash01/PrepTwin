import { TrendingUp, Sparkles, BrainCircuit, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { AIAvatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'

const SCORES = [
  { label: 'Technical', value: '8.2', width: 82, bar: 'bg-green-500', valueClass: 'text-green-400' },
  { label: 'Communication', value: '7.8', width: 78, bar: 'bg-primary-500', valueClass: 'text-primary-400' },
  { label: 'Relevance', value: '9.1', width: 91, bar: 'bg-green-500', valueClass: 'text-green-400' },
]

function SoundBars({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end gap-[3px]', className)} aria-hidden="true">
      {[0.5, 1, 0.7, 0.9, 0.45, 0.8, 0.6].map((height, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-primary-400 animate-pulse"
          style={{ height: `${height * 14}px`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  )
}

function FloatingCard({
  className,
  children,
  delay,
}: {
  className?: string
  children: React.ReactNode
  delay?: string
}) {
  return (
    <div
      className={cn(
        'absolute z-20 glass rounded-2xl border border-surface-700/50 p-4 shadow-xl shadow-black/20',
        className
      )}
      style={delay ? { animationDelay: delay } : undefined}
    >
      {children}
    </div>
  )
}

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none" aria-hidden="true">
      <div className="animate-float">
        <div className="glass rounded-3xl border border-surface-700/50 shadow-2xl shadow-primary-500/5">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">PT</span>
                </div>
                <span className="text-xs font-bold tracking-widest text-surface-300">PREPTWIN</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 animate-ping opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                LIVE
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <AIAvatar size="sm" speaking />
              <div>
                <p className="text-sm font-semibold text-surface-100">AI Interviewer</p>
                <p className="text-xs text-primary-400">Adaptive • Role-specific</p>
              </div>
              <Badge variant="primary" className="ml-auto">Active</Badge>
            </div>

            <div className="rounded-2xl bg-surface-900/50 border border-surface-700/50 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-primary-500/20 text-primary-300 text-xs font-medium">Question 04 / 10</span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-700 text-surface-400 text-xs font-medium">System Design • Hard</span>
              </div>
              <p className="text-surface-100 text-sm sm:text-base leading-relaxed">
                "How would you design a REST API for a large-scale application? Walk me through your validation, rate-limiting, and scaling choices."
              </p>
            </div>

            <div className="my-5 h-px bg-gradient-to-r from-transparent via-surface-600 to-transparent" />

            <div className="space-y-3">
              {SCORES.map(score => (
                <div key={score.label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs text-surface-400">{score.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-700/60 overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-700', score.bar)} style={{ width: `${score.width}%` }} />
                  </div>
                  <span className={cn('w-8 shrink-0 text-right text-sm font-bold', score.valueClass)}>{score.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-900/50 border border-surface-700/50 px-4 py-3">
              <div>
                <p className="text-xs text-surface-400">Adaptive Difficulty</p>
                <p className="text-sm font-semibold text-surface-100 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Increasing
                </p>
              </div>
              <SoundBars />
            </div>
          </div>
        </div>
      </div>

      <FloatingCard className="-top-8 -left-4 sm:-left-8 animate-float-delayed w-52">
        <div className="mb-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-xs text-surface-400">Adaptive Difficulty</span>
        </div>
        <p className="text-sm font-semibold text-green-400 mb-0.5">↑ Difficulty increased</p>
        <p className="text-xs text-surface-500">Strong technical response detected</p>
      </FloatingCard>

      <FloatingCard className="-bottom-8 -right-3 sm:-right-6 animate-float w-56">
        <div className="mb-2.5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-400" />
          </div>
          <span className="text-xs text-surface-400">Candidate Twin</span>
        </div>
        <p className="text-xs font-medium text-surface-200 mb-3">Candidate Twin updated</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] text-surface-500">Backend</span>
            <div className="flex-1 h-1.5 rounded-full bg-surface-700/60 overflow-hidden">
              <div className="h-full rounded-full bg-primary-500" style={{ width: '88%' }} />
            </div>
            <span className="w-7 shrink-0 text-right text-[11px] font-semibold text-surface-300">88%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] text-surface-500">Comm.</span>
            <div className="flex-1 h-1.5 rounded-full bg-surface-700/60 overflow-hidden">
              <div className="h-full rounded-full bg-primary-500" style={{ width: '74%' }} />
            </div>
            <span className="w-7 shrink-0 text-right text-[11px] font-semibold text-surface-300">74%</span>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="hidden lg:block -right-16 top-1/3 animate-float-delayed w-48">
        <div className="mb-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-700 border border-surface-600 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-primary-400" />
          </div>
          <span className="text-xs text-surface-400">AI Evaluation</span>
        </div>
        <p className="text-xs font-medium text-surface-200 mb-2.5">Answer analyzed</p>
        <div className="space-y-1.5">
          {[
            { label: 'Technical', value: '8/10' },
            { label: 'Relevance', value: '9/10' },
            { label: 'Clarity', value: '8/10' },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-[11px]">
              <span className="text-surface-500">{row.label}</span>
              <span className="font-semibold text-surface-200">{row.value}</span>
            </div>
          ))}
        </div>
        <ChevronDown className="w-4 h-4 text-surface-500 mt-3" />
      </FloatingCard>
    </div>
  )
}