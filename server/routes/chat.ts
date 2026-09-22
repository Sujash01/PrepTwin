import { Router } from 'express'
import {
  InterviewServiceError,
  sendChatMessage,
  startChat,
  sanitizeFoundryMessage,
} from '../services/foundryService.js'

/**
 * chatRouter
 *
 * Direct chat with the same Foundry 'PrepTwin-Interviewer' agent, without a
 * candidate profile. React only ever calls this Express route - credentials
 * never reach the browser. Foundry threads provide session memory when
 * configured; otherwise the clearly-labelled local mock responder is used.
 */

export const chatRouter = Router()

const SESSION_ID_PATTERN = /^[A-Za-z0-9:_-]{1,200}$/
const MAX_MESSAGE_CHARS = 4000

function cleanString(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function handleError(res: {
  status: (code: number) => { json: (body: unknown) => void }
}, error: unknown): void {
  if (error instanceof InterviewServiceError && error.kind === 'session') {
    res.status(404).json({ success: false, message: 'Chat session not found or has expired.' })
    return
  }
  console.error('[chat]', sanitizeFoundryMessage(error instanceof Error ? error.message : String(error)))
  res.status(502).json({ success: false, message: "PrepTwin couldn't respond right now." })
}

chatRouter.post('/message', async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>

  const sessionId = cleanString(body.sessionId, 200)
  const message = cleanString(body.message, MAX_MESSAGE_CHARS)

  if (sessionId && !SESSION_ID_PATTERN.test(sessionId)) {
    res.status(400).json({ success: false, message: 'Invalid session id.' })
    return
  }
  if (!message) {
    res.status(400).json({ success: false, message: 'Please enter a message first.' })
    return
  }

  try {
    const result = sessionId
      ? await sendChatMessage(sessionId, message)
      : await startChat(message)
    res.status(200).json({
      success: true,
      sessionId: result.sessionId,
      reply: result.reply,
      mode: result.mode,
    })
  } catch (error) {
    handleError(res, error)
  }
})