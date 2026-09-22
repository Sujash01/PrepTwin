import { createRequire } from 'node:module'

/**
 * speechService
 *
 * The only module in the backend that talks to Azure AI Speech.
 *
 * Architecture: the React app never holds Speech credentials. It uploads a WAV
 * clip to POST /api/speech/transcribe and asks POST /api/speech/synthesize for
 * question audio; both endpoints resolve through this module.
 *
 * IMPORTANT (inspection result from Part 7):
 *   * The repo has NO runtime-bound "Speech MCP" integration: there is no MCP
 *     config in this codebase and a running Express process cannot invoke MCP
 *     client tools anyway. The original `src/services/speechService.ts` is a
 *     mock, so it is being replaced by this real adapter.
 *   * The authoritative, current Azure Speech interface for Node.js is the
 *     official `microsoft-cognitiveservices-speech-sdk` (v1.51.0 installed).
 *     It requires a Speech resource key + region (or an Entra token) and works
 *     server-side with in-memory audio streams - no blob storage round trip.
 *
 * If the Speech environment variables are missing the service reports
 * "not-configured" deterministically; it never fakes a transcript or audio.
 * The frontend treats that exactly like any other speech failure and falls
 * back to text, so the interview always continues.
 */

const require = createRequire(import.meta.url)
const sdk = require('microsoft-cognitiveservices-speech-sdk') as typeof import('microsoft-cognitiveservices-speech-sdk')

export interface TranscriptionResult {
  text: string
}

export interface SynthesisResult {
  audioBase64: string
  mimeType: string
  durationMs?: number
}

export type SpeechErrorKind = 'not-configured' | 'format' | 'upstream'

export class SpeechServiceError extends Error {
  readonly kind: SpeechErrorKind

  constructor(kind: SpeechErrorKind, message: string) {
    super(message)
    this.name = 'SpeechServiceError'
    this.kind = kind
  }
}

const region = (process.env.AZURE_SPEECH_REGION ?? '').trim()
const key = (process.env.AZURE_SPEECH_KEY ?? '').trim()
const language = (process.env.SPEECH_LANGUAGE ?? 'en-US').trim() || 'en-US'
const voiceName = (process.env.SPEECH_VOICE ?? 'en-US-AriaNeural').trim() || 'en-US-AriaNeural'
const OUTPUT_FORMAT = sdk.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm

export function isSpeechConfigured(): boolean {
  return Boolean(region && key)
}

function requireConfig(): void {
  if (!isSpeechConfigured()) {
    throw new SpeechServiceError(
      'not-configured',
      'Azure Speech is not configured (AZURE_SPEECH_REGION / AZURE_SPEECH_KEY).',
    )
  }
}

interface WavInfo {
  pcm: Buffer
  sampleRate: number
}

function parseWav(buffer: Buffer): WavInfo {
  if (buffer.length < 44) throw new SpeechServiceError('format', 'Audio clip is too short to be a WAV file.')
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new SpeechServiceError('format', 'Audio clip is not a RIFF/WAVE file.')
  }

  let audioFormat = 0
  let sampleRate = 0
  let bitsPerSample = 0
  let dataOffset = -1

  let offset = 12
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4)
    const chunkSize = buffer.readUInt32LE(offset + 4)
    if (chunkId === 'fmt ') {
      audioFormat = buffer.readUInt16LE(offset + 8)
      sampleRate = buffer.readUInt32LE(offset + 12)
      bitsPerSample = buffer.readUInt16LE(offset + 22)
    } else if (chunkId === 'data') {
      dataOffset = offset + 8
      break
    }
    offset += 8 + chunkSize + (chunkSize % 2)
  }

  if (dataOffset < 0 || dataOffset >= buffer.length) {
    throw new SpeechServiceError('format', 'Audio clip contains no PCM data chunk.')
  }
  if (audioFormat !== 1) throw new SpeechServiceError('format', 'Only uncompressed PCM WAV audio is supported.')
  if (bitsPerSample !== 16) throw new SpeechServiceError('format', 'Only 16-bit PCM WAV audio is supported.')

  const pcm = buffer.subarray(dataOffset)
  if (pcm.length === 0) throw new SpeechServiceError('format', 'Audio clip contains no samples.')

  return { pcm, sampleRate }
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
  requireConfig()

  const { pcm, sampleRate } = parseWav(audioBuffer)

  const speechConfig = sdk.SpeechConfig.fromSubscription(key, region)
  speechConfig.speechRecognitionLanguage = language

  return new Promise<TranscriptionResult>((resolve, reject) => {
    let recognizer: InstanceType<typeof sdk.SpeechRecognizer> | undefined

    const fail = (error: unknown, kind: SpeechErrorKind = 'upstream') => {
      try {
        recognizer?.close()
      } catch {
        // best effort
      }
      const message = error instanceof Error ? error.message : String(error)
      reject(error instanceof SpeechServiceError ? error : new SpeechServiceError(kind, message))
    }

    try {
      const format = sdk.AudioStreamFormat.getWaveFormatPCM(sampleRate, 16, 1)
      const inputStream = sdk.AudioInputStream.createPushStream(format)
      const audioBytes = pcm.buffer.slice(
        pcm.byteOffset,
        pcm.byteOffset + pcm.byteLength,
      ) as ArrayBuffer
      inputStream.write(audioBytes)
      inputStream.close()
      const audioConfig = sdk.AudioConfig.fromStreamInput(inputStream)
      recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)

      recognizer.recognizeOnceAsync(
        result => {
          try {
            if (result.reason === sdk.ResultReason.RecognizedSpeech && result.text.trim()) {
              resolve({ text: result.text.trim() })
            } else {
              reject(new SpeechServiceError('upstream', 'No speech was recognized in the audio clip.'))
            }
          } finally {
            recognizer?.close()
          }
        },
        error => fail(error),
      )
    } catch (error) {
      fail(error)
    }
  })
}

export async function synthesizeSpeech(text: string): Promise<SynthesisResult> {
  requireConfig()

  const speechConfig = sdk.SpeechConfig.fromSubscription(key, region)
  speechConfig.speechSynthesisVoiceName = voiceName
  speechConfig.speechSynthesisOutputFormat = OUTPUT_FORMAT

  return new Promise<SynthesisResult>((resolve, reject) => {
    let synthesizer: InstanceType<typeof sdk.SpeechSynthesizer> | undefined

    const fail = (error: unknown) => {
      try {
        synthesizer?.close()
      } catch {
        // best effort
      }
      const message = error instanceof Error ? error.message : String(error)
      reject(error instanceof SpeechServiceError ? error : new SpeechServiceError('upstream', message))
    }

    try {
      synthesizer = new sdk.SpeechSynthesizer(speechConfig)

      synthesizer.speakTextAsync(
        text,
        result => {
          try {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted && result.audioData) {
              const audio = Buffer.from(result.audioData)
              const durationNs = (result as { audioDuration?: number }).audioDuration
              resolve({
                audioBase64: audio.toString('base64'),
                mimeType: 'audio/wav',
                durationMs: typeof durationNs === 'number' ? Math.round(durationNs / 1_000_000) : undefined,
              })
            } else {
              reject(new SpeechServiceError('upstream', 'Speech synthesis did not produce audio.'))
            }
          } finally {
            synthesizer?.close()
          }
        },
        error => fail(error),
      )
    } catch (error) {
      fail(error)
    }
  })
}