import { randomBytes } from 'node:crypto'

/**
 * resumeContext
 *
 * Short-lived, in-memory holder for extracted resume text between the moment a
 * candidate uploads a resume on /setup and the moment an interview session is
 * started. The full extracted text NEVER leaves this process: the browser only
 * receives the opaque `resumeId` token and the client stores lightweight
 * metadata (filename / processed) in sessionStorage.
 */

const STORE_TTL_MS = 30 * 60 * 1000
const MAX_ENTRIES = 30

export interface StoredResumeContext {
  id: string
  filename: string
  text: string
  createdAt: number
}

const contexts = new Map<string, StoredResumeContext>()

function purgeStale(now: number): void {
  for (const [id, entry] of contexts) {
    if (now - entry.createdAt > STORE_TTL_MS) contexts.delete(id)
  }
}

function purgeOverflow(): void {
  while (contexts.size > MAX_ENTRIES) {
    let oldestId: string | null = null
    let oldestTime = Number.POSITIVE_INFINITY
    for (const [id, entry] of contexts) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt
        oldestId = id
      }
    }
    if (oldestId) contexts.delete(oldestId)
  }
}

export function storeResumeContext(filename: string, text: string): StoredResumeContext {
  const now = Date.now()
  purgeStale(now)
  const entry: StoredResumeContext = {
    id: `resume-${randomBytes(12).toString('hex')}`,
    filename,
    text,
    createdAt: now,
  }
  contexts.set(entry.id, entry)
  purgeOverflow()
  return entry
}

export function findResumeContext(id: string): StoredResumeContext | undefined {
  const entry = contexts.get(id)
  if (!entry) return undefined
  if (Date.now() - entry.createdAt > STORE_TTL_MS) {
    contexts.delete(id)
    return undefined
  }
  return entry
}

export function consumeResumeContext(id: string): void {
  contexts.delete(id)
}

export function clearResumeContext(id: string): void {
  contexts.delete(id)
}