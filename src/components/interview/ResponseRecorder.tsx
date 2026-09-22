import { Mic, Square, Loader2, Pencil, Send, CheckCircle2, AlertCircle, Keyboard } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Waveform } from '../ui/Waveform'
import { cn } from '../../utils/helpers'

export type RecorderState = 'idle' | 'recording' | 'transcribing' | 'ready' | 'submitting' | 'error'
export type RecorderErrorKind = 'permission' | 'audio' | 'service' | null
export type AnswerMode = 'text' | 'voice'

interface ResponseRecorderProps {
  state: RecorderState
  transcript: string
  recordingTime: number
  isEditing: boolean
  errorKind: RecorderErrorKind
  mode: AnswerMode
  voiceAvailable: boolean
  disabled?: boolean
  onStart: () => void
  onStop: () => void
  onRetry: () => void
  onContinueWithoutMic: () => void
  onModeChange: (mode: AnswerMode) => void
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

function ModeToggle({
  mode,
  voiceAvailable,
  onModeChange,
}: {
  mode: AnswerMode
  voiceAvailable: boolean
  onModeChange: (mode: AnswerMode) => void
}) {
  const item = 'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50'
  return (
    <div
      role="group"
      aria-label="Answer mode"
      className="inline-flex items-center gap-1 rounded-xl border border-surface-600 bg-surface-800/60 p-1"
    >
      <button
        type="button"
        onClick={() => onModeChange('text')}
        aria-pressed={mode === 'text'}
        className={cn(
          item,
          mode === 'text' ? 'bg-primary-600 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200'
        )}
      >
        <Keyboard className="w-4 h-4" aria-hidden="true" />
        Text
      </button>
      <button
        type="button"
        onClick={() => onModeChange('voice')}
        disabled={!voiceAvailable}
        aria-pressed={mode === 'voice'}
        title={voiceAvailable ? undefined : 'Voice mode unavailable'}
        className={cn(
          item,
          mode === 'voice' ? 'bg-primary-600 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200',
          !voiceAvailable && 'opacity-40 cursor-not-allowed'
        )}
      >
        <Mic className="w-4 h-4" aria-hidden="true" />
        Voice
      </button>
    </div>
  )
}

function VoiceUnavailableNote() {
  return (
    <p className="mt-3 text-center text-xs text-surface-500" role="status">
      Voice mode unavailable — you can continue using text mode.
    </p>
  )
}

export function ResponseRecorder({
  state,
  transcript,
  recordingTime,
  isEditing,
  errorKind,
  mode,
  voiceAvailable,
  disabled,
  onStart,
  onStop,
  onRetry,
  onContinueWithoutMic,
  onModeChange,
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
        <div className="flex justify-center mb-4">
          <ModeToggle mode={mode} voiceAvailable={voiceAvailable} onModeChange={onModeChange} />
        </div>

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
    const copy =
      errorKind === 'permission'
        ? {
            title: 'Microphone access was denied.',
            body: 'You can continue using text mode.',
          }
        : errorKind === 'service'
          ? {
              title: 'Voice mode is temporarily unavailable.',
              body: 'You can continue with text mode.',
            }
          : {
              title: "We couldn't understand the audio.",
              body: 'Please try again or use text mode.',
            }
    return (
      <Card variant="glass" padding="lg" className={cn('animate-fade-in', className)}>
        <div className="flex justify-center mb-6">
          <ModeToggle mode={mode} voiceAvailable={voiceAvailable} onModeChange={onModeChange} />
        </div>

        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" aria-hidden="true" />
          </div>
          <p className="text-surface-100 font-semibold">{copy.title}</p>
          <p className="mt-1 text-sm text-surface-500">{copy.body}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {errorKind !== 'permission' && <Button onClick={onRetry}>Try Again</Button>}
            <Button variant="ghost" onClick={onContinueWithoutMic}>
              <Keyboard className="w-4 h-4 mr-2" aria-hidden="true" />
              Continue with text
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="glass" padding="lg" className={cn('animate-fade-in', className)}>
      <div className="flex justify-center mb-6">
        <ModeToggle mode={mode} voiceAvailable={voiceAvailable} onModeChange={onModeChange} />
      </div>

      {mode === 'voice' ? (
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
      ) : (
        <>
          <label htmlFor="text-answer" className="block text-xs font-semibold uppercase tracking-widest text-surface-500 mb-2">
            Your answer
          </label>
          <textarea
            id="text-answer"
            value={transcript}
            onChange={e => onEditChange(e.target.value)}
            rows={4}
            disabled={disabled}
            aria-label="Type your answer"
            placeholder="Type your answer..."
            className="w-full rounded-xl border border-surface-600 bg-surface-900/70 p-3 text-sm text-surface-100 resize-none outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 disabled:opacity-60 transition-colors"
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
        </>
      )}

      {voiceAvailable && mode === 'voice' && (
        <div className="mt-8 flex items-center gap-3 text-xs text-surface-500">
          <span className="h-px flex-1 bg-surface-700/60" aria-hidden="true" />
          <span>or type your answer</span>
          <span className="h-px flex-1 bg-surface-700/60" aria-hidden="true" />
        </div>
      )}

      {voiceAvailable && mode === 'voice' && (
        <textarea
          value={transcript}
          onChange={e => onEditChange(e.target.value)}
          rows={3}
          disabled={disabled}
          aria-label="Type your answer"
          placeholder="Type your answer..."
          className="mt-4 w-full rounded-xl border border-surface-600 bg-surface-900/70 p-3 text-sm text-surface-100 resize-none outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 disabled:opacity-60 transition-colors"
        />
      )}

      {voiceAvailable && mode === 'voice' && (
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
      )}

      {!voiceAvailable && <VoiceUnavailableNote />}
    </Card>
  )
}