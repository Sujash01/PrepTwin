/**
 * interviewSessions
 *
 * In-memory holder for live interview progress: a bounded conversation,
 * every completed evaluation (question + candidate answer + scores), and
 * metadata used by the future Candidate Twin and the /summary endpoint.
 *
 * Storage is deliberately minimal and server-side - the browser only ever
 * sees a `feedback.status` flag during the interview plus opaque session ids.
 * Nothing sensitive (scores, prompts, resume text) is handed to the client for
 * storage. Entries expire after the TTL so memory stays bounded.
 */

import type { EvaluationScores } from './evaluationService.js'
const SESSION_TTL_MS = 2 * 60 * 60 * 1000
const MAX_SESSIONS = 100
const MAX_CONVERSATION_ENTRIES = 120
const MAX_TOPICS = 40
const MAX_ANSWER_CHARS = 4000

export type SessionDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface SessionProfile {
  name: string
  role: string
  experience: string
  skills: string[]
  focus: string
}

export interface SessionConversationEntry {
  role: 'interviewer' | 'candidate'
  text: string
}

export interface SessionEvaluationEntry {
  question: string
  answer: string
  difficulty: SessionDifficulty
  scores: EvaluationScores
  at: number
}

export interface InterviewSessionState {
  sessionId: string
  createdAt: number
  mode: string
  profile: SessionProfile
  conversation: SessionConversationEntry[]
  evaluations: SessionEvaluationEntry[]
  topics: string[]
  isComplete: boolean
  completedAt: number | null
  /** Highest difficulty seen, used to guide mock-mode adaptation. */
  lastDifficulty: SessionDifficulty
  /** The question the candidate is currently facing (used for evaluation records). */
  currentQuestion: { text: string; difficulty: SessionDifficulty; topic: string } | null
}

const sessions = new Map<string, InterviewSessionState>()

function purgeStale(now: number): void {
  for (const [id, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) sessions.delete(id)
  }
}

function purgeOverflow(): void {
  while (sessions.size > MAX_SESSIONS) {
    let oldestId: string | null = null
    let oldestTime = Number.POSITIVE_INFINITY
    for (const [id, session] of sessions) {
      if (session.createdAt < oldestTime) {
        oldestTime = session.createdAt
        oldestId = id
      }
    }
    if (oldestId) sessions.delete(oldestId)
  }
}

function cleanEntryText(value: string, max: number): string {
  return value.trim().slice(0, max)
}

export function createSession(
  sessionId: string,
  mode: string,
  profile: SessionProfile,
  greeting: string,
  topics: string[] = [],
): InterviewSessionState {
  purgeStale(Date.now())
  const session: InterviewSessionState = {
    sessionId,
    createdAt: Date.now(),
    mode,
    profile: {
      name: cleanEntryText(profile.name, 100),
      role: cleanEntryText(profile.role, 100),
      experience: cleanEntryText(profile.experience, 100),
      skills: profile.skills.slice(0, 25).map(skill => cleanEntryText(skill, 100)),
      focus: cleanEntryText(profile.focus, 50),
    },
    conversation: [{ role: 'interviewer', text: cleanEntryText(greeting, 2000) }],
    evaluations: [],
    topics: topics.slice(0, MAX_TOPICS),
    isComplete: false,
    completedAt: null,
    lastDifficulty: 'Medium',
    currentQuestion:
      greeting.trim() !== ''
        ? { text: cleanEntryText(greeting, 2000), difficulty: 'Easy', topic: topics[0] ?? '' }
        : null,
  }
  sessions.set(sessionId, session)
  purgeOverflow()
  return session
}

export function getSession(sessionId: string): InterviewSessionState | undefined {
  const session = sessions.get(sessionId)
  if (!session) return undefined
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(sessionId)
    return undefined
  }
  return session
}

export function pushCandidateAnswer(sessionId: string, text: string): InterviewSessionState | null {
  const session = getSession(sessionId)
  if (!session) return null
  session.conversation.push({ role: 'candidate', text: cleanEntryText(text, MAX_ANSWER_CHARS) })
  if (session.conversation.length > MAX_CONVERSATION_ENTRIES) {
    session.conversation.splice(0, session.conversation.length - MAX_CONVERSATION_ENTRIES)
  }
  return session
}

export function pushInterviewerMessage(
  sessionId: string,
  text: string,
  topicTokens: string[],
  difficulty: SessionDifficulty,
): InterviewSessionState | null {
  const session = getSession(sessionId)
  if (!session) return null
  session.conversation.push({ role: 'interviewer', text: cleanEntryText(text, 2000) })
  if (session.conversation.length > MAX_CONVERSATION_ENTRIES) {
    session.conversation.splice(0, session.conversation.length - MAX_CONVERSATION_ENTRIES)
  }
  session.lastDifficulty = difficulty
  for (const token of topicTokens) {
    if (token && token.length <= 80 && !session.topics.includes(token)) {
      session.topics.push(token)
    }
  }
  if (session.topics.length > MAX_TOPICS) {
    session.topics.splice(0, session.topics.length - MAX_TOPICS)
  }
  return session
}

export function recordEvaluation(
  sessionId: string,
  entry: Omit<SessionEvaluationEntry, 'at'>,
): InterviewSessionState | null {
  const session = getSession(sessionId)
  if (!session) return null
  session.evaluations.push({ ...entry, at: Date.now() })
  return session
}

export function markSessionComplete(sessionId: string): InterviewSessionState | null {
  const session = getSession(sessionId)
  if (!session) return null
  session.isComplete = true
  session.completedAt = Date.now()
  return session
}

export function dropSession(sessionId: string): void {
  sessions.delete(sessionId)
}