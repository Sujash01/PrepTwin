import { getApiBaseUrl } from './interviewApi'

export interface ChatResponse {
  success: boolean
  sessionId: string
  reply: string
  mode?: string
}

export type ChatApiErrorKind = 'network' | 'server' | 'bad-request'

export class ChatApiError extends Error {
  readonly kind: ChatApiErrorKind

  constructor(kind: ChatApiErrorKind, message: string) {
    super(message)
    this.name = 'ChatApiError'
    this.kind = kind
  }
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
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch {
    throw new ChatApiError('network', "PrepTwin couldn't respond right now.")
  } finally {
    clearTimeout(timeout)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new ChatApiError('server', "PrepTwin couldn't respond right now.")
  }

  if (!response.ok) {
    throw new ChatApiError(
      response.status === 400 ? 'bad-request' : 'server',
      readErrorMessage(data),
    )
  }

  return data as T
}

export const chatApi = {
  async sendMessage(sessionId: string | null, message: string): Promise<ChatResponse> {
    return postJson<ChatResponse>('/api/chat/message', {
      ...(sessionId ? { sessionId } : {}),
      message,
    })
  },
}