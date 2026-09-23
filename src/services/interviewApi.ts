import type { InterviewFocus } from '../utils/types'
import type { MockDifficulty } from '../data/mockInterview'

export interface InterviewQuestion {
  text: string
  topic?: string
  difficulty: MockDifficulty
}

export interface StartInterviewResponse {
  success: boolean
  sessionId: string
  question: InterviewQuestion
  mode?: string
}

export type FeedbackStatus = 'analyzed' | 'failed'

/**
 * Subtle per-answer feedback status exposed to the UI. Detailed coaching
 * scores are intentionally NOT part of the live interview responses - they
 * stay server-side until the session summary.
 */
export interface InterviewFeedback {
  status: FeedbackStatus
}

export interface SendInterviewMessageResponse {
  success: boolean
  sessionId: string
  question: InterviewQuestion
  isComplete: boolean
  mode?: string
  feedback?: InterviewFeedback
}

export interface StartInterviewPayload {
  name: string
  role: string
  experience: string
  skills: string[]
  focus: InterviewFocus
  /** Opaque server-side resume context token (optional). */
  resumeId?: string
  /** Interview mode: practice or real */
  mode?: 'practice' | 'real'
  /** Number of questions for the interview */
  questionCount?: number
}

export type InterviewApiErrorKind = 'network' | 'server' | 'bad-request'

export class InterviewApiError extends Error {
  readonly kind: InterviewApiErrorKind

  constructor(kind: InterviewApiErrorKind, message: string) {
    super(message)
    this.name = 'InterviewApiError'
    this.kind = kind
  }
}

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

function readErrorMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null) {
    const message = (data as Record<string, unknown>).message
    if (typeof message === 'string' && message) return message
  }
  return "PrepTwin couldn't respond right now."
}

async function postJson<T>(path: string, payload: unknown, timeoutMs = 45000): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch {
    throw new InterviewApiError('network', "PrepTwin couldn't respond right now.")
  } finally {
    clearTimeout(timeout)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new InterviewApiError('server', "PrepTwin couldn't respond right now.")
  }

  if (!response.ok) {
    throw new InterviewApiError(
      response.status === 400 ? 'bad-request' : 'server',
      readErrorMessage(data),
    )
  }

  return data as T
}

export interface SessionSummaryResponse {
  success: boolean
  sessionId: string
  status: 'completed' | 'in-progress'
  mode?: string
  questionsAsked: number
  questionsAnswered: number
  overallScores: {
    technical: number
    relevance: number
    communication: number
    clarity: number
    structure: number
    confidence: number
    depth: number
  }
  categoryScores: Array<{ category: string; score: number }>
  strengths: string[]
  improvements: string[]
  performanceTrend: 'Improving' | 'Stable' | 'Developing' | 'Not enough data'
  trendSeries: Array<{ question: number; score: number }>
  averageScore: number
  topicsCovered: string[]
  disclaimer: string
}

async function getJson<T>(path: string, timeoutMs = 20000): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
  } catch {
    throw new InterviewApiError('network', "PrepTwin couldn't respond right now.")
  } finally {
    clearTimeout(timeout)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new InterviewApiError('server', "PrepTwin couldn't respond right now.")
  }

  if (!response.ok) {
    throw new InterviewApiError(
      response.status === 400 || response.status === 404 ? 'bad-request' : 'server',
      readErrorMessage(data),
    )
  }

  return data as T
}

export const interviewApi = {
  async startInterview(payload: StartInterviewPayload): Promise<StartInterviewResponse> {
    return postJson<StartInterviewResponse>('/api/interview/start', payload)
  },

  async sendMessage(sessionId: string, message: string): Promise<SendInterviewMessageResponse> {
    return postJson<SendInterviewMessageResponse>('/api/interview/message', { sessionId, message })
  },

  async fetchSummary(sessionId: string): Promise<SessionSummaryResponse> {
    return getJson<SessionSummaryResponse>(`/api/interview/${encodeURIComponent(sessionId)}/summary`)
  },
}