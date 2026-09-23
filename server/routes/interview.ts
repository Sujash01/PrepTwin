import { Router } from 'express'
import {
  InterviewServiceError,
  sendInterviewMessage,
  startInterview,
  isMockMode,
  getFoundryStatus,
} from '../services/foundryService.js'
import type {
  CandidateProfile,
  InterviewDifficulty,
} from '../services/foundryService.js'
import {
  consumeResumeContext,
  findResumeContext,
} from '../services/resumeContext.js'
import {
  buildAdaptation,
  buildAggregateSummary,
  EVALUATION_CATEGORIES,
} from '../services/evaluationService.js'
import { sanitizeFoundryMessage } from '../services/foundryService.js'
import {
  createSession,
  getSession,
  markSessionComplete,
  pushCandidateAnswer,
  pushInterviewerMessage,
  recordEvaluation,
} from '../services/interviewSessions.js'
import type { SessionDifficulty } from '../services/interviewSessions.js'

export const interviewRouter = Router()

const VALID_FOCUSES = new Set(['technical', 'behavioral', 'system-design', 'projects', 'mixed'])
const SESSION_ID_PATTERN = /^[A-Za-z0-9:_-]{1,200}$/
const RESUME_ID_PATTERN = /^resume-[A-Za-z0-9]{1,200}$/

function cleanString(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function topicTokens(topic: string | undefined): string[] {
  return (topic ?? '')
    .split(',')
    .map(token => token.trim())
    .filter(Boolean)
    .slice(0, 10)
}

function handleError(res: {
  status: (code: number) => { json: (body: unknown) => void }
}, error: unknown): void {
  if (error instanceof InterviewServiceError && error.kind === 'session') {
    res.status(404).json({ success: false, message: 'Interview session not found or has expired.' })
    return
  }
  console.error('[interview]', sanitizeFoundryMessage(error instanceof Error ? error.message : String(error)))
  res.status(502).json({ success: false, message: "PrepTwin couldn't respond right now." })
}

/** Derives a safe UI difficulty label for the next question from the coaching adjustment. */
function deriveNextDifficulty(
  previous: SessionDifficulty,
  adjustment: 'increase' | 'maintain' | 'decrease' | undefined,
): SessionDifficulty {
  if (adjustment === 'increase') return previous === 'Easy' ? 'Medium' : 'Hard'
  if (adjustment === 'decrease') return previous === 'Hard' ? 'Medium' : 'Easy'
  return previous
}

interviewRouter.post('/start', async (req, res) => {
  console.log('[Interview] POST /start request received', JSON.stringify(req.body))
  const body = (req.body ?? {}) as Record<string, unknown>

  const name = cleanString(body.name, 100)
  const role = cleanString(body.role, 100)
  const experience = cleanString(body.experience, 100)
  const focus = cleanString(body.focus, 50).toLowerCase()

  const skills = Array.isArray(body.skills)
    ? body.skills
        .filter((skill): skill is string => typeof skill === 'string')
        .map(skill => skill.trim().slice(0, 100))
        .filter(Boolean)
        .slice(0, 25)
    : []

  if (!name || !role || !experience || skills.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please provide name, role, experience and at least one skill.',
    })
    return
  }
  if (!VALID_FOCUSES.has(focus)) {
    res.status(400).json({ success: false, message: 'Invalid interview focus value.' })
    return
  }

  const mode = body.mode === 'practice' || body.mode === 'real' ? body.mode : 'practice'
  const questionCount = typeof body.questionCount === 'number' && body.questionCount > 0
    ? Math.min(Math.max(body.questionCount, 1), 50)
    : 10

  const profile: CandidateProfile = { name, role, experience, skills, focus, mode, questionCount }

  const resumeId = cleanString(body.resumeId, 1000)
  const resumeContext = resumeId && RESUME_ID_PATTERN.test(resumeId)
    ? findResumeContext(resumeId)
    : undefined
  if (resumeContext) {
    profile.resumeText = resumeContext.text
  }

  try {
    console.log('[Interview] Calling startInterview with profile:', JSON.stringify({ name, role, experience, skills, focus, mode, questionCount }))
    const result = await startInterview(profile)
    console.log('[Interview] startInterview succeeded:', result.sessionId)
    if (resumeContext) {
      consumeResumeContext(resumeContext.id)
    }
    createSession(
      result.sessionId,
      result.mode,
      { name, role, experience, skills, focus, mode, questionCount },
      result.question.text,
      topicTokens(result.question.topic),
    )
    res.status(200).json({
      success: true,
      message: 'Interview session started.',
      sessionId: result.sessionId,
      question: result.question,
      mode: result.mode,
    })
  } catch (error) {
    console.error('[Interview] startInterview error:', error instanceof Error ? error.message : String(error), error instanceof Error ? error.stack : '')
    handleError(res, error)
  }
})

interviewRouter.post('/message', async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>

  const sessionId = cleanString(body.sessionId, 200)
  const message = cleanString(body.message, 4000)

  if (!SESSION_ID_PATTERN.test(sessionId)) {
    res.status(400).json({ success: false, message: 'Invalid session id.' })
    return
  }
  if (!message) {
    res.status(400).json({ success: false, message: 'Please provide an answer before submitting.' })
    return
  }

  let state = getSession(sessionId)
  if (!state) {
    // The server-side session record holds the mapping to the Foundry
    // conversation (opaque PrepTwin session ids), so a missing record means the
    // conversation mapping is gone too - the session cannot be resumed.
    res.status(404).json({ success: false, message: 'Interview session not found or has expired.' })
    return
  }

  const answeredQuestion = state.currentQuestion
  const adaptation = state.evaluations.length > 0 ? buildAdaptation(state.evaluations) : null

  try {
    const result = await sendInterviewMessage(sessionId, message, {
      adaptation: adaptation?.guidance,
    })

    pushCandidateAnswer(sessionId, message)

    if (result.evaluation) {
      recordEvaluation(sessionId, {
        question: answeredQuestion?.text ?? '',
        answer: message,
        difficulty: answeredQuestion?.difficulty ?? state.lastDifficulty,
        scores: result.evaluation,
      })
    }

    const difficulty: InterviewDifficulty = isMockMode()
      ? result.question.difficulty
      : deriveNextDifficulty(state.lastDifficulty, result.evaluation?.difficultyAdjustment)
    result.question.difficulty = difficulty

    pushInterviewerMessage(sessionId, result.question.text, topicTokens(result.question.topic), difficulty)
    state.currentQuestion = {
      text: result.question.text,
      difficulty,
      topic: result.question.topic ?? '',
    }

    if (result.isComplete) {
      markSessionComplete(sessionId)
    }

    res.status(200).json({
      success: true,
      sessionId: result.sessionId,
      question: result.question,
      isComplete: result.isComplete,
      mode: result.mode,
      feedback: {
        status: result.evaluation ? 'analyzed' : 'failed',
      },
    })
  } catch (error) {
    handleError(res, error)
  }
})

interviewRouter.get('/:sessionId/summary', (req, res) => {
  const sessionId = cleanString(req.params.sessionId, 200)
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    res.status(400).json({ success: false, message: 'Invalid session id.' })
    return
  }

  const state = getSession(sessionId)
  if (!state) {
    res.status(404).json({ success: false, message: 'Interview session not found or has expired.' })
    return
  }

  const aggregate = buildAggregateSummary(state.evaluations)
  const questionsAsked = state.conversation.filter(entry => entry.role === 'interviewer').length

  res.status(200).json({
    success: true,
    sessionId,
    status: state.isComplete ? 'completed' : 'in-progress',
    mode: state.mode,
    questionsAsked,
    questionsAnswered: state.evaluations.length,
    overallScores: aggregate.overallScores,
    categoryScores: EVALUATION_CATEGORIES.map(category => ({
      category,
      score: aggregate.overallScores[category],
    })),
    strengths: aggregate.strengths,
    improvements: aggregate.improvements,
    performanceTrend: aggregate.trend,
    trendSeries: aggregate.trendSeries,
    averageScore: aggregate.averageScore,
    topicsCovered: state.topics,
    disclaimer:
      'Scores are AI-generated coaching estimates for practice feedback - not objective measurements or hiring decisions.',
  })
})

if (isMockMode()) {
  console.warn(`[interview] ${getFoundryStatus().reason}`)
}