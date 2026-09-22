import { Mic, Square, Loader2, Pencil, Send, CheckCircle2, AlertCircle, Keyboard } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Waveform } from '../ui/Waveform'
import { cn } from '../../utils/helpers'

export type RecorderState = 'idle' | 'recording' | 'transcribing' | 'ready' | 'submitting' | 'error'
export type RecorderErrorKind = 'permission' | 'audio' | null

interface ResponseRecorderProps {
  state: RecorderState
  transcript: string
  recordingTime: number
  isEditing: boolean
  errorKind: RecorderErrorKind
  disabled?: boolean
  onStart: () => void
  onStop: () => void
  onRetry: () => void
  onContinueWithoutMic: () => void
  onSubmit: () => void
  onToggleEdit: () => void
  onEditChange: (value: string) => void
  className?: string
}

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
}

export function ResponseRecorder({
  state,
  transcript,
  recordingTime,
  isEditing,
  errorKind,
  disabled,
  onStart,
  onStop,
  onRetry,
  onContinueWithoutMic,
  onSubmit,
  onToggleEdit,
  onEditChange,
  className,
}: ResponseRecorderProps) {
  if (state === 'transcribing' || state === 'submitting') {
    const busyLabel = state === 'transcribing' ? 'Transcribing your response...' : 'Submitting your answer...'
    const busyHint = state === 'transcribing'
      ? 'Converting your spoken answer to text.'
      : 'Sending your response to the interviewer.'
    return (
      <Card variant="glass" padding="lg" className={cn('text-center animate-fade-in', className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div aria-hidden="true" className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
            <div className="relative w-14 h-14 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          </div>
          <p className="text-surface-200 font-medium">{busyLabel}</p>
          <p className="text-sm text-surface-500">{busyHint}</p>
        </div>
      </Card>
    )
  }

  if (state === 'recording') {
    return (
      <Card variant="glass" padding="lg" className={cn('text-center animate-fade-in', className)}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
          <span className="font-semibold text-red-400">Listening...</span>
        </div>

        <Waveform active barCount={24} color="red-400" height={56} className="max-w-sm mx-auto" />

        <p className="mt-6 font-mono text-3xl text-surface-100" aria-label={`Recording time ${formatTime(recordingTime)}`}>
          {formatTime(recordingTime)}
        </p>

        <button
          onClick={onStop}
          aria-label="Stop recording"
          className="mt-6 flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-400 transition-all duration-200 animate-pulse focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <Square className="w-6 h-6" fill="currentColor" />
        </button>
        <p className="mt-3 text-sm text-surface-500">Click to stop</p>
      </Card>
    )
  }

  if (state === 'ready') {
    const trimmed = transcript.trim()
    return (
      <Card variant="glass" padding="md" className={cn('animate-fade-in', className)}>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-green-400" aria-hidden="true" />
          <span className="text-sm font-medium text-surface-300">Transcribed answer</span>
        </div>

        {isEditing ? (
          <textarea
            value={transcript}
            onChange={e => onEditChange(e.target.value)}
            rows={4}
            aria-label="Edit your answer"
            className="w-full rounded-xl border border-surface-600 bg-surface-900/70 p-3 text-sm text-surface-100 resize-none outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 transition-colors"
          />
        ) : (
          <div className="rounded-xl border border-surface-700/60 bg-surface-900/50 p-4 text-sm leading-relaxed text-surface-200 whitespace-pre-wrap">
            {transcript}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onToggleEdit}>
            <Pencil className="w-4 h-4 mr-1.5" aria-hidden="true" />
            {isEditing ? 'Save' : 'Edit response'}
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={!trimmed || disabled}>
            Submit answer
            <Send className="w-4 h-4 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </Card>
    )
  }

  if (state === 'error') {
    return (
      <Card variant="glass" padding="lg" className={cn('text-center animate-fade-in', className)}>
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" aria-hidden="true" />
        </div>
        {errorKind === 'permission' ? (
          <>
            <p className="text-surface-100 font-semibold">Microphone access is unavailable.</p>
            <p className="mt-1 text-sm text-surface-500">
              You can still answer by typing below.
            </p>
            <Button className="mt-6" variant="primary" onClick={onContinueWithoutMic}>
              <Keyboard className="w-4 h-4 mr-2" aria-hidden="true" />
              Continue with text
            </Button>
          </>
        ) : (
          <>
            <p className="text-surface-100 font-semibold">We couldn't process your audio.</p>
            <p className="mt-1 text-sm text-surface-500">
              Check your microphone and connection, then try again — or answer by typing.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={onRetry}>Try Again</Button>
              <Button variant="ghost" onClick={onContinueWithoutMic}>
                <Keyboard className="w-4 h-4 mr-2" aria-hidden="true" />
                Continue with text
              </Button>
            </div>
          </>
        )}
      </Card>
    )
  }

  return (
    <Card variant="glass" padding="lg" className={cn('animate-fade-in', className)}>
      <div className="text-center">
        <button
          onClick={onStart}
          disabled={disabled}
          aria-label="Start recording your answer"
          className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white shadow-lg shadow-primary-500/20 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-950"
        >
          <Mic className="w-8 h-8" aria-hidden="true" />
        </button>
        <p className="mt-6 font-semibold text-surface-200">Click the microphone to answer</p>
        <p className="mt-1 text-sm text-surface-500">Speak your answer aloud — it will be transcribed automatically.</p>
      </div>

      <div className="mt-8 flex items-center gap-3 text-xs text-surface-500">
        <span className="h-px flex-1 bg-surface-700/60" aria-hidden="true" />
        <span>or type your answer</span>
        <span className="h-px flex-1 bg-surface-700/60" aria-hidden="true" />
      </div>

      <textarea
        value={transcript}
        onChange={e => onEditChange(e.target.value)}
        rows={3}
        disabled={disabled}
        aria-label="Type your answer"
        placeholder="Type your answer..."
        className="mt-4 w-full rounded-xl border border-surface-600 bg-surface-900/70 p-3 text-sm text-surface-100 resize-none outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 disabled:opacity-60 transition-colors"
      />

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={!transcript.trim() || disabled}
        >
          Submit Answer
          <Send className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  )
}