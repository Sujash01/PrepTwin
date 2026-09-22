import { Router, json, raw } from 'express'
import {
  SpeechServiceError,
  isSpeechConfigured,
  synthesizeSpeech,
  transcribeAudio,
} from '../services/speechService.js'

export const speechRouter = Router()

const AUDIO_CONTENT_TYPES = new Set(['audio/wav', 'audio/x-wav', 'audio/wave'])
const MAX_AUDIO_BYTES = 10 * 1024 * 1024
const MAX_SYNTH_TEXT = 2000

function sendSpeechError(
  res: { status: (code: number) => { json: (body: unknown) => void } },
  error: unknown,
): void {
  if (error instanceof SpeechServiceError) {
    if (error.kind === 'not-configured') {
      res.status(501).json({ success: false, message: 'Speech service is not configured on the server.' })
      return
    }
    if (error.kind === 'format') {
      res.status(422).json({ success: false, message: 'The audio clip could not be processed.' })
      return
    }
  }
  console.error('[speech]', error instanceof Error ? error.message : error)
  res.status(502).json({ success: false, message: "Speech couldn't process your audio right now." })
}

speechRouter.get('/status', (_req, res) => {
  res.status(200).json({ configured: isSpeechConfigured() })
})

speechRouter.post(
  '/transcribe',
  raw({ type: Array.from(AUDIO_CONTENT_TYPES), limit: MAX_AUDIO_BYTES }),
  async (req, res) => {
    const contentType = (req.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
    if (!AUDIO_CONTENT_TYPES.has(contentType)) {
      res.status(415).json({ success: false, message: 'Unsupported audio format.' })
      return
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(422).json({ success: false, message: 'No audio data received.' })
      return
    }

    try {
      const result = await transcribeAudio(req.body)
      res.status(200).json({ success: true, text: result.text })
    } catch (error) {
      sendSpeechError(res, error)
    }
  },
)

speechRouter.post('/synthesize', json({ limit: '32kb' }), async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
  if (!text) {
    res.status(400).json({ success: false, message: 'Please provide text to synthesize.' })
    return
  }
  if (text.length > MAX_SYNTH_TEXT) {
    res.status(400).json({ success: false, message: 'Text is too long to synthesize.' })
    return
  }

  try {
    const result = await synthesizeSpeech(text)
    res.status(200).json({
      success: true,
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      durationMs: result.durationMs ?? null,
    })
  } catch (error) {
    sendSpeechError(res, error)
  }
})