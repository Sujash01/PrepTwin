import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Check, Loader2, RefreshCw, Settings, Volume2, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useCandidate, useToast } from '../hooks/useApp'
import { interviewApi } from '../services/interviewApi'
import type { InterviewQuestion, FeedbackStatus } from '../services/interviewApi'
import type { MockDifficulty } from '../data/mockInterview'
import { MOCK_INTERVIEW_META } from '../data/mockInterview'
import type { InterviewFocus } from '../utils/types'
import { InterviewHeader } from '../components/interview/InterviewHeader'
import { InterviewProgress } from '../components/interview/InterviewProgress'
import { InterviewerCard } from '../components/interview/InterviewerCard'
import type { InterviewerStatus } from '../components/interview/InterviewerCard'
import { ResponseRecorder } from '../components/interview/ResponseRecorder'
import type { AnswerMode, RecorderState, RecorderErrorKind } from '../components/interview/ResponseRecorder'
import { InterviewInsights, AdaptiveStatus } from '../components/interview/InterviewInsights'
import { ExitInterviewModal } from '../components/interview/ExitInterviewModal'
import { cn } from '../utils/helpers'
import {
  AudioCaptureError,
  createRecordingSession,
  ensureMicrophone,
  releaseMicrophone,
} from '../services/audioRecorder'
import type { RecordingSession } from '../services/audioRecorder'
import { SpeechApiError } from '../services/speechApi'
import { speechService } from '../services/speechService'
import { playTtsBytes, stopTtsPlayback } from '../services/ttsPlayer'

const FOCUS_LABELS: Record<InterviewFocus, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  'system-design': 'System Design',
  projects: 'Projects',
  mixed: 'Mixed',
}

const DIFFICULTY_LEVELS: Record<MockDifficulty, number> = {
  Easy: 45,
  Medium: 75,
  Hard: 100,
}

type SessionPhase = 'connecting' | 'ready' | 'answering' | 'error' | 'complete'

interface ConversationEntry {
  role: 'interviewer' | 'candidate'
  text: string
}

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
}

function classifyCaptureError(error: unknown): RecorderErrorKind {
  if (error instanceof AudioCaptureError) {
    return error.kind === 'permission-denied' || error.kind === 'no-device' ? 'permission' : 'audio'
  }
  return 'audio'
}

function classifyTranscriptError(error: unknown): RecorderErrorKind {
  if (error instanceof AudioCaptureError) {
    return error.kind === 'permission-denied' || error.kind === 'no-device' ? 'permission' : 'audio'
  }
  if (error instanceof SpeechApiError) {
    return error.kind === 'not-configured' || error.kind === 'network' || error.kind === 'server'
      ? 'service'
      : 'audio'
  }
  return 'service'
}

export function InterviewRoomPage() {
  const navigate = useNavigate()
  const { candidate } = useCandidate()
  const showToast = useToast()

  const [phase, setPhase] = useState<SessionPhase>('connecting')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [question, setQuestion] = useState<InterviewQuestion | null>(null)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null)
  /** Subtle post-answer coaching status. Detailed scores are never shown here. */
  const [lastFeedback, setLastFeedback] = useState<FeedbackStatus | null>(null)

  const [recorder, setRecorder] = useState<RecorderState>('idle')
  const [recorderError, setRecorderError] = useState<RecorderErrorKind>(null)
  const [transcript, setTranscript] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [mode, setMode] = useState<AnswerMode>('text')
  const [voiceAvailable, setVoiceAvailable] = useState(true)
  const [ttsUsed, setTtsUsed] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isExitOpen, setIsExitOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  )

  const recordingSessionRef = useRef<RecordingSession | null>(null)
  const sessionStartedRef = useRef(false)

  const isActive = phase !== 'complete'

  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => setElapsed(secs => secs + 1), 1000)
    return () => clearInterval(timer)
  }, [isActive])

  useEffect(() => {
    if (recorder !== 'recording') return
    const timer = setInterval(() => setRecordingTime(secs => secs + 1), 1000)
    return () => clearInterval(timer)
  }, [recorder])

  useEffect(() => {
    return () => {
      stopTtsPlayback()
      releaseMicrophone()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    speechService
      .getSpeechStatus()
      .then(status => {
        if (cancelled) return
        setVoiceAvailable(status.configured)
        if (!status.configured) setMode('text')
      })
      .catch(() => {
        if (!cancelled) setVoiceAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const speakQuestion = useCallback(async (text: string) => {
    setIsSpeaking(true)
    try {
      const audio = await speechService.synthesizeSpeech(text)
      await playTtsBytes(audio.audioBase64, audio.mimeType)
      setTtsUsed(true)
    } catch {
      // TTS failed — the question stays on screen as text.
      showToast("Couldn't play the interviewer audio. The question is still available as text.", 'error')
    } finally {
      setIsSpeaking(false)
    }
  }, [showToast])

  const stopListening = useCallback(() => {
    stopTtsPlayback()
    setIsSpeaking(false)
  }, [])

  const handleModeChange = useCallback((next: AnswerMode) => {
    setMode(next)
    if (next === 'text') {
      stopTtsPlayback()
      setIsSpeaking(false)
      setRecorderError(null)
      setRecorder(current => (current === 'error' ? 'idle' : current))
    }
  }, [])

  const startSession = useCallback(async () => {
    if (!candidate) return
    setPhase('connecting')
    setPendingAnswer(null)
    try {
      const result = await interviewApi.startInterview({
        name: candidate.name,
        role: candidate.role,
        experience: candidate.experience,
        skills: candidate.skills,
        focus: candidate.focus,
        resumeId: candidate.resume?.resumeId,
      })
      setSessionId(result.sessionId)
      setQuestion(result.question)
      setQuestionNumber(1)
      setConversation([{ role: 'interviewer', text: result.question.text }])
      setPhase('ready')
      if (mode === 'voice') void speakQuestion(result.question.text)
    } catch {
      setPhase('error')
    }
  }, [candidate, speakQuestion, mode])

  useEffect(() => {
    if (!candidate || sessionStartedRef.current) return
    sessionStartedRef.current = true
    void startSession()
  }, [candidate, startSession])

  const sendAnswer = useCallback(
    async (rawText: string) => {
      const text = rawText.trim()
      if (!sessionId || !text) return
      setPendingAnswer(text)
      setPhase('answering')
      setLastFeedback(null)
      setRecorder('idle')
      setRecorderError(null)
      setIsEditing(false)
      setTranscript('')
      try {
        const result = await interviewApi.sendMessage(sessionId, text)
        setLastFeedback(result.feedback?.status ?? null)
        setConversation(prev => [
          ...prev,
          { role: 'candidate', text },
          { role: 'interviewer', text: result.question.text },
        ])
        setPendingAnswer(null)
        if (result.isComplete) {
          stopTtsPlayback()
          setIsSpeaking(false)
          setQuestion(result.question)
          setPhase('complete')
        } else {
          setQuestion(result.question)
          setQuestionNumber(n => n + 1)
          setRecorder('idle')
          setRecorderError(null)
          setPhase('ready')
          if (mode === 'voice') void speakQuestion(result.question.text)
        }
      } catch {
        setPhase('error')
      }
    },
    [sessionId, speakQuestion, mode],
  )

  const startRecording = useCallback(async () => {
    if (phase !== 'ready' || recorder !== 'idle') return
    stopTtsPlayback()
    setIsSpeaking(false)
    setRecordingTime(0)
    setRecorderError(null)
    try {
      const stream = await ensureMicrophone()
      const session = createRecordingSession(stream)
      recordingSessionRef.current = session
      setTranscript('')
      setIsEditing(false)
      setRecorder('recording')
    } catch (error) {
      setRecorderError(classifyCaptureError(error))
      setRecorder('error')
    }
  }, [phase, recorder])

  const stopRecording = useCallback(async () => {
    if (recorder !== 'recording') return
    const session = recordingSessionRef.current
    if (!session) return
    recordingSessionRef.current = null
    setRecorder('transcribing')
    try {
      const clip = await session.stop()
      const text = await speechService.transcribeAudio(clip.wav)
      setTranscript(text)
      setIsEditing(text.trim().length === 0)
      setRecordingTime(Math.round(clip.durationMs / 1000))
      setRecorder('ready')
    } catch (error) {
      setRecorderError(classifyTranscriptError(error))
      setRecorder('error')
    }
  }, [recorder])

  const handleRetryAudio = useCallback(() => {
    setRecorderError(null)
    setTranscript('')
    setIsEditing(false)
    setRecorder('idle')
  }, [])

  const continueWithoutMic = useCallback(() => {
    setMode('text')
    setRecorderError(null)
    setTranscript('')
    setIsEditing(false)
    setRecorder('idle')
  }, [])

  const submitAnswer = () => {
    if (phase !== 'ready' || !transcript.trim()) return
    if (recorder !== 'idle' && recorder !== 'ready') return
    setRecorder('submitting')
    void sendAnswer(transcript)
  }

  const handleRetry = () => {
    if (pendingAnswer) {
      void sendAnswer(pendingAnswer)
    } else {
      void startSession()
    }
  }

  const handleExit = () => {
    setIsExitOpen(false)
    showToast('Interview left. Your progress was cleared.', 'info')
    navigate('/')
  }

  const interviewerStatus: InterviewerStatus = isSpeaking ? 'speaking'
    : phase === 'connecting' || phase === 'answering' ? 'thinking'
    : recorder === 'recording' ? 'listening'
    : recorder === 'transcribing' ? 'thinking'
    : ttsUsed ? 'listening'
    : 'asking'

  const answeredCount = useMemo(
    () => conversation.filter(entry => entry.role === 'candidate').length,
    [conversation],
  )

  const topics = useMemo(() => {
    const seen: string[] = []
    const focusLabel = candidate ? FOCUS_LABELS[candidate.focus] : MOCK_INTERVIEW_META.focus
    if (focusLabel && !seen.includes(focusLabel)) seen.push(focusLabel)
    if (question?.topic) {
      question.topic.split(', ').forEach(topic => {
        if (!seen.includes(topic)) seen.push(topic)
      })
    }
    return seen
  }, [question, candidate])

  const difficulty: MockDifficulty = question?.difficulty ?? 'Medium'
  const difficultyLevel = DIFFICULTY_LEVELS[difficulty]
  const focusLabel = candidate
    ? (FOCUS_LABELS[candidate.focus] ?? MOCK_INTERVIEW_META.focus)
    : MOCK_INTERVIEW_META.focus

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-500/20 flex items-center justify-center">
            <Settings className="w-8 h-8 text-primary-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-surface-100 mb-3">Let's set up your interview first</h1>
          <p className="text-surface-400 mb-8">You need to complete your candidate profile before starting an interview.</p>
          <div className="flex flex-col gap-3">
            <Link to="/setup">
              <Button className="w-full">Go to Setup</Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (phase === 'complete') {
    const duration = formatTime(elapsed)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-10 text-center max-w-lg w-full animate-scale-in">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-primary-500/30 rounded-full animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/40 to-primary-500/40 flex items-center justify-center border border-green-500/50">
              <Check className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-surface-100 mb-3">Interview Complete</h1>
          <p className="text-surface-300 mb-8">
            Great work, {candidate.name.split(' ')[0]}. Your Candidate Twin is being calibrated — detailed scoring unlocks when your full session is processed.
          </p>

          <div className="rounded-2xl border border-surface-700/50 bg-surface-900/50 p-5 mb-8 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-surface-400">Questions answered</span>
              <span className="text-surface-100 font-medium">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-400">Duration</span>
              <span className="text-surface-100 font-medium">{duration}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-400">Interview focus</span>
              <span className="text-surface-100 font-medium capitalize">{focusLabel}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  let caption: { text: string; spinner: boolean } | null = null
  if (phase === 'connecting' || phase === 'answering') {
    caption = { text: 'PrepTwin is thinking...', spinner: true }
  } else if (phase === 'ready') {
    if (isSpeaking) {
      caption = { text: 'PrepTwin is speaking...', spinner: false }
    } else if (mode === 'text') {
      caption = { text: 'PrepTwin is asking — type your answer below.', spinner: false }
    } else if (ttsUsed) {
      caption = { text: 'PrepTwin is listening — record or type your answer.', spinner: false }
    } else {
      caption = { text: 'PrepTwin is asking — record or type your answer.', spinner: false }
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 relative overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(109,74,255,0.08),transparent)]"
      />

      <InterviewHeader
        questionLabel={String(questionNumber)}
        elapsed={elapsed}
        onExit={() => setIsExitOpen(true)}
        onToggleInsights={() => setInsightsOpen(v => !v)}
        insightsOpen={insightsOpen}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <InterviewProgress current={questionNumber} answered={answeredCount} />

            <InterviewerCard
              questionNumber={questionNumber}
              question={question}
              status={interviewerStatus}
            />

            {caption && (
              <p className="-mt-2 text-center text-sm text-surface-500 animate-fade-in">
                {caption.spinner && (
                  <Loader2 className="inline w-3.5 h-3.5 mr-1.5 animate-spin text-primary-400" aria-hidden="true" />
                )}
                {caption.text}
              </p>
            )}

            {phase === 'ready' && question && (
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => (isSpeaking ? stopListening() : void speakQuestion(question.text))}
                  disabled={!voiceAvailable}
                  aria-label={isSpeaking ? 'Stop question audio' : 'Listen to the question'}
                  title={voiceAvailable ? undefined : 'Voice unavailable — question shown as text'}
                >
                  <Volume2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  {isSpeaking ? 'Stop' : 'Listen'}
                </Button>
              </div>
            )}

            {phase === 'ready' && lastFeedback !== null && (
              <p className="-mt-2 text-center text-xs text-green-400/90 animate-fade-in" role="status">
                {lastFeedback === 'analyzed' ? (
                  <>
                    <Check className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" />
                    Answer analyzed — PrepTwin is adapting…
                  </>
                ) : (
                  "We couldn't generate coaching feedback for this answer, but your interview can continue."
                )}
              </p>
            )}

            {phase === 'error' ? (
              <Card variant="glass" padding="lg" className="text-center animate-fade-in">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" aria-hidden="true" />
                </div>
                <p className="text-surface-100 font-semibold">PrepTwin couldn't respond right now.</p>
                <p className="mt-1 text-sm text-surface-500">Check that the interview service is running, then try again.</p>
                <Button className="mt-6" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                  Try Again
                </Button>
              </Card>
            ) : (
              <ResponseRecorder
                state={recorder}
                transcript={transcript}
                recordingTime={recordingTime}
                isEditing={isEditing}
                errorKind={recorderError}
                mode={mode}
                voiceAvailable={voiceAvailable}
                disabled={phase !== 'ready'}
                onStart={() => void startRecording()}
                onStop={() => void stopRecording()}
                onRetry={handleRetryAudio}
                onContinueWithoutMic={continueWithoutMic}
                onModeChange={handleModeChange}
                onSubmit={submitAnswer}
                onToggleEdit={() => setIsEditing(v => !v)}
                onEditChange={setTranscript}
              />
            )}

            <AdaptiveStatus difficulty={difficulty} level={difficultyLevel} />

            {conversation.length > 1 && (
              <Card padding="md" className="animate-fade-in">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-surface-500">
                  Session transcript
                </p>
                <ul className="space-y-4">
                  {conversation.map((entry, index) => (
                    <li key={index} className="space-y-1">
                      <p className="text-xs font-medium text-surface-500">
                        {entry.role === 'interviewer' ? 'PrepTwin Interviewer' : 'You'}
                      </p>
                      <p className="text-sm leading-relaxed text-surface-200">{entry.text}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <aside
            className={cn(
              'hidden lg:block shrink-0 overflow-hidden transition-[width] duration-300',
              insightsOpen ? 'lg:w-80' : 'lg:w-0'
            )}
          >
            <div className="lg:w-80">
              <div className={cn('transition-opacity duration-200', insightsOpen ? 'opacity-100' : 'opacity-0')}>
                <InterviewInsights
                  focus={focusLabel}
                  difficulty={difficulty}
                  level={difficultyLevel}
                  trend={MOCK_INTERVIEW_META.performanceTrend}
                  topics={topics}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {insightsOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setInsightsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-surface-950/95 backdrop-blur-xl border-l border-surface-700/50 p-5 animate-slide-left">
            <div className="flex items-center justify-between mb-5">
              <p className="text-lg font-semibold text-surface-100">Interview Insights</p>
              <button
                onClick={() => setInsightsOpen(false)}
                className="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                aria-label="Close interview insights"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <InterviewInsights
              focus={focusLabel}
              difficulty={difficulty}
              level={difficultyLevel}
              trend={MOCK_INTERVIEW_META.performanceTrend}
              topics={topics}
            />
          </div>
        </div>
      )}

      <ExitInterviewModal
        isOpen={isExitOpen}
        onClose={() => setIsExitOpen(false)}
        onExit={handleExit}
      />
    </div>
  )
}

export default InterviewRoomPage