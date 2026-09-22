import { Router, json, raw } from 'express'
import {
  ResumeServiceError,
  extractResumeText,
} from '../services/resumeService.js'
import {
  clearResumeContext,
  storeResumeContext,
} from '../services/resumeContext.js'

export const resumeRouter = Router()

const MAX_RESUME_BYTES = 5 * 1024 * 1024
const RESUME_ID_PATTERN = /^[A-Za-z0-9:_-]{1,200}$/

function cleanHeaderValue(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max).replace(/[\\/]/g, '')
}

resumeRouter.post(
  '/parse',
  raw({ type: () => true, limit: MAX_RESUME_BYTES }),
  async (req, res) => {
    const filename = cleanHeaderValue(req.get('x-filename') ?? req.get('filename'), 200)

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(422).json({ success: false, message: 'No file received.' })
      return
    }
    if (req.body.length > MAX_RESUME_BYTES) {
      res.status(413).json({ success: false, message: 'Resume must be 5 MB or smaller.' })
      return
    }

    try {
      const extracted = await extractResumeText(req.body, { filename })
      const stored = storeResumeContext(filename || 'resume', extracted.text)
      res.status(200).json({
        success: true,
        filename: stored.filename,
        resumeId: stored.id,
        metadata: extracted.pages !== undefined ? { pages: extracted.pages } : {},
      })
    } catch (error) {
      if (error instanceof ResumeServiceError) {
        if (error.kind === 'unsupported-type') {
          res.status(415).json({ success: false, message: error.message })
          return
        }
        if (error.kind === 'no-text') {
          res.status(422).json({ success: false, message: "We couldn't extract readable text from this resume." })
          return
        }
      }
      console.error('[resume]', error instanceof Error ? error.message : error)
      res.status(422).json({ success: false, message: "We couldn't process your resume." })
    }
  },
)

resumeRouter.post('/clear', json({ limit: '8kb' }), (req, res) => {
  const resumeId = typeof req.body?.resumeId === 'string' ? req.body.resumeId.trim().slice(0, 200) : ''
  if (resumeId && RESUME_ID_PATTERN.test(resumeId)) {
    clearResumeContext(resumeId)
  }
  res.status(200).json({ success: true })
})