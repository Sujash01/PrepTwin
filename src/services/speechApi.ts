import { getApiBaseUrl } from './interviewApi'

export type SpeechApiErrorKind = 'network' | 'server' | 'not-configured' | 'format'

export class SpeechApiError extends Error {
  readonly kind: SpeechApiErrorKind

  constructor(kind: SpeechApiErrorKind, message: string) {
    super(message)
    this.name = 'SpeechApiError'
    this.kind = kind
  }
}

function readErrorMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null) {
    const message = (data as Record<string, unknown>).message
    if (typeof message === 'string' && message) return message
  }
  return "Speech couldn't process your audio right now."
}

async function request<T>(path: string, init: RequestInit, timeoutMs = 45000): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { ...init, signal: controller.signal })
  } catch {
    throw new SpeechApiError('network', "Couldn't reach the speech service.")
  } finally {
    clearTimeout(timeout)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new SpeechApiError('server', "Speech couldn't process your audio right now.")
  }

  if (!response.ok) {
    const kind: SpeechApiErrorKind =
      response.status === 501 ? 'not-configured'
      : response.status === 415 || response.status === 422 ? 'format'
      : 'server'
    throw new SpeechApiError(kind, readErrorMessage(data))
  }

  return data as T
}

interface TranscribeResponse {
  success: boolean
  text: string
}

interface SynthesizeResponse {
  success: boolean
  audioBase64: string
  mimeType: string
  durationMs: number | null
}

export interface TtsAudio {
  audioBase64: string
  mimeType: string
  durationMs: number | null
}

export const speechApi = {
  async transcribe(wav: Blob): Promise<string> {
    const result = await request<TranscribeResponse>('/api/speech/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': wav.type || 'audio/wav' },
      body: wav,
    })
    if (!result.success) {
      throw new SpeechApiError('server', "Speech couldn't process your audio right now.")
    }
    return result.text
  },

  async synthesize(text: string): Promise<TtsAudio> {
    const result = await request<SynthesizeResponse>('/api/speech/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }, 30000)
    if (!result.success) {
      throw new SpeechApiError('server', 'Text-to-speech is not available right now.')
    }
    return { audioBase64: result.audioBase64, mimeType: result.mimeType, durationMs: result.durationMs }
  },
}