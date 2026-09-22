import { getApiBaseUrl } from './interviewApi'

export type ResumeApiErrorKind = 'network' | 'server' | 'bad-request' | 'unsupported'

export class ResumeApiError extends Error {
  readonly kind: ResumeApiErrorKind

  constructor(kind: ResumeApiErrorKind, message: string) {
    super(message)
    this.name = 'ResumeApiError'
    this.kind = kind
  }
}

export interface ParseResumeResponse {
  success: boolean
  filename?: string
  text?: string
  resumeId?: string
  metadata?: { pages?: number }
}

function readErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null) {
    const message = (data as Record<string, unknown>).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}

const MAX_PARSE_FILE_BYTES = 5 * 1024 * 1024

export const resumeApi = {
  /**
   * Uploads a resume file and asks the backend to extract its text. The full
   * extracted text stays server-side; the returned token is all the client
   * persists.
   */
  async parse(file: File): Promise<ParseResumeResponse> {
    if (file.size > MAX_PARSE_FILE_BYTES) {
      throw new ResumeApiError('bad-request', 'Resume must be 5 MB or smaller.')
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    let response: Response
    try {
      response = await fetch(`${getApiBaseUrl()}/api/resume/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'X-Filename': file.name,
        },
        body: file,
        signal: controller.signal,
      })
    } catch {
      throw new ResumeApiError('network', "We couldn't reach the resume service.")
    } finally {
      clearTimeout(timeout)
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      throw new ResumeApiError('server', "We couldn't process your resume.")
    }

    if (!response.ok) {
      const kind: ResumeApiErrorKind =
        response.status === 415 ? 'unsupported'
        : response.status === 400 || response.status === 422 ? 'bad-request'
        : 'server'
      throw new ResumeApiError(kind, readErrorMessage(data, "We couldn't process your resume."))
    }

    return data as ParseResumeResponse
  },

  /** Best-effort removal of server-side resume context when the candidate removes the file. */
  async clear(resumeId: string): Promise<void> {
    try {
      await fetch(`${getApiBaseUrl()}/api/resume/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      })
    } catch {
      // best effort - the server auto-expires stored contexts.
    }
  },
}