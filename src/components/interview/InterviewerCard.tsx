import { AIAvatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { cn } from '../../utils/helpers'
import type { InterviewQuestion } from '../../services/interviewApi'

export type InterviewerStatus = 'asking' | 'thinking' | 'listening' | 'speaking'

const STATUS_META: Record<InterviewerStatus, { label: string; dot: string; text: string; glow: string }> = {
  asking: {
    label: 'Asking',
    dot: 'bg-primary-400',
    text: 'text-primary-300',
    glow: 'bg-primary-500/25',
  },
  thinking: {
    label: 'Thinking',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    glow: 'bg-amber-500/25',
  },
  listening: {
    label: 'Listening',
    dot: 'bg-green-400',
    text: 'text-green-300',
    glow: 'bg-green-500/20',
  },
  speaking: {
    label: 'Speaking',
    dot: 'bg-sky-400',
    text: 'text-sky-300',
    glow: 'bg-sky-500/25',
  },
}

interface InterviewerCardProps {
  questionNumber: number
  question: InterviewQuestion | null
  status: InterviewerStatus
  className?: string
}

export function InterviewerCard({
  questionNumber,
  question,
  status,
  className,
}: InterviewerCardProps) {
  const meta = STATUS_META[status]
  const speaking = status === 'asking' || status === 'thinking' || status === 'speaking'

  return (
    <Card variant="glass" padding="lg" className={cn('relative overflow-hidden text-center', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-primary-500/10 blur-3xl"
      />

      <div className="relative flex flex-col items-center">
        <div className="relative">
          {speaking && (
            <div
              aria-hidden="true"
              className={cn('absolute -inset-3 rounded-full blur-xl animate-pulse', meta.glow)}
            />
          )}
          <AIAvatar size="xl" speaking={speaking} />
        </div>

        <p className="mt-5 text-lg font-semibold text-surface-100">
          PrepTwin Interviewer{' '}
          <Badge variant="primary" size="sm" className="ml-1 align-middle">
            AI
          </Badge>
        </p>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-surface-700 bg-surface-800/60 px-3 py-1">
          <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', meta.dot)} aria-hidden="true" />
          <span className={cn('text-xs font-medium', meta.text)}>{meta.label}</span>
        </div>
      </div>

      <div className="relative mt-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-surface-500">
          Question {questionNumber}
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold leading-relaxed text-surface-100">
          {question ? question.text : 'PrepTwin is setting up your interview...'}
        </h1>
      </div>
    </Card>
  )
}