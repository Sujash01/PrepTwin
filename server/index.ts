import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import type { NextFunction, Request, Response } from 'express'
import { interviewRouter } from './routes/interview.js'
import { chatRouter } from './routes/chat.js'
import { speechRouter } from './routes/speech.js'
import { resumeRouter } from './routes/resume.js'
import { getFoundryStatus } from './services/foundryService.js'

const app = express()
const port = Number(process.env.PORT ?? 5000)

const explicitOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
/**
 * Vite stays on 5173 but silently moves to 5174..5179 when 5173 is already
 * taken (e.g. a stale dev server). The browser origin then changes and would
 * otherwise be blocked, making the UI fail while curl works. Allow the local
 * loopback dev range only - never arbitrary LAN origins.
 */
const DEV_ORIGIN_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1):(517\d|5180)$/

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || explicitOrigins.includes(origin) || DEV_ORIGIN_PATTERN.test(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Origin not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
)

app.use(express.json({ limit: '200kb' }))

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

/**
 * Secret-safe AI status used by probes and support diagnostics. Never includes
 * credentials, full endpoints or prompts - only the provider mode, whether real
 * Foundry is configured, and how the real agent would authenticate.
 */
app.get('/api/ai/status', (_req, res) => {
  const status = getFoundryStatus()
  res.status(200).json({
    provider: status.mode === 'foundry' ? 'foundry' : 'local-mock',
    configured: status.configured,
    forceMock: status.forceMock,
    auth: status.auth,
    agentId: status.agentId,
    error: status.error,
    reason: status.reason,
  })
})

app.use('/api/interview', interviewRouter)
app.use('/api/chat', chatRouter)
app.use('/api/speech', speechRouter)
app.use('/api/resume', resumeRouter)

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found.' })
})

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const rawError = error as Error & { type?: string }
  if (rawError.type === 'entity.too.large') {
    res.status(413).json({ success: false, message: 'Request body is too large.' })
    return
  }
  if (rawError.type === 'entity.parse.failed') {
    res.status(400).json({ success: false, message: 'Invalid request body.' })
    return
  }
  if (error.message === 'Origin not allowed by CORS') {
    res.status(403).json({ success: false, message: 'Origin not allowed.' })
    return
  }
  console.error('[api]', error.message)
  res.status(500).json({ success: false, message: 'An unexpected error occurred.' })
})

app.listen(port, () => {
  console.log(`PrepTwin API listening on http://localhost:${port}`)
  console.log(`CORS allowed origins: ${explicitOrigins.length > 0 ? explicitOrigins.join(', ') : 'loopback dev range (localhost:5170-5180)'}`)

  const status = getFoundryStatus()
  if (status.mode === 'foundry') {
    console.log(`Foundry interviewer: active - real 'PrepTwin-Interviewer' agent (agent name: ${status.agentId}, auth: Azure DefaultAzureCredential (Entra ID))`)
    if (status.error) {
      console.warn(`Foundry reachability: LAST CALL FAILED - ${status.error}`)
    } else {
      console.log(`Foundry reachability: ${status.reason}`)
    }
  } else {
    console.warn('Foundry interviewer: LOCAL MOCK mode (no real Foundry traffic)')
    if (status.forceMock) {
      console.warn('FOUNDRY_MOCK_MODE=true is set - real Foundry credentials are present but being ignored.')
    }
    console.warn(status.reason)
  }
})