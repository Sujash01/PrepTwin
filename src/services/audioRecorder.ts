/**
 * Browser microphone capture.
 *
 * Flow: getUserMedia -> MediaRecorder (whatever codec the browser supports,
 * e.g. webm/opus) -> Web Audio decode -> re-encode a 16 kHz mono 16-bit WAV.
 * Deliberately produces WAV because the backend Speech SDK transcribes
 * uncompressed PCM reliably from a push stream; the browser conversion keeps
 * the audio compatible without any server-side transcoding.
 *
 * The mic stream (and the permission state) are cached for the lifetime of the
 * module, so once permission is granted or denied we never re-prompt.
 */

export type AudioCaptureErrorKind = 'permission-denied' | 'no-device' | 'unsupported' | 'encode' | 'no-audio'

export class AudioCaptureError extends Error {
  readonly kind: AudioCaptureErrorKind

  constructor(kind: AudioCaptureErrorKind, message: string) {
    super(message)
    this.name = 'AudioCaptureError'
    this.kind = kind
  }
}

export interface RecordedClip {
  wav: Blob
  durationMs: number
}

export interface RecordingSession {
  stop: () => Promise<RecordedClip>
}

const TARGET_SAMPLE_RATE = 16000
const RECORDER_MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
]

let cachedStream: MediaStream | null = null
let permissionState: 'unknown' | 'granted' | 'denied' | 'unavailable' = 'unknown'

export function getMicrophonePermissionState(): 'unknown' | 'granted' | 'denied' | 'unavailable' {
  return permissionState
}

function errorForUnavailable(name: string): AudioCaptureError {
  const isDenied = name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError'
  const kind: AudioCaptureErrorKind = isDenied || name === 'NotFoundError' ? 'permission-denied' : 'unsupported'
  return new AudioCaptureError(kind, 'Microphone access is unavailable.')
}

export async function ensureMicrophone(): Promise<MediaStream> {
  if (cachedStream && cachedStream.active) return cachedStream
  if (permissionState === 'denied' || permissionState === 'unavailable') {
    throw new AudioCaptureError('permission-denied', 'Microphone access is unavailable.')
  }
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    permissionState = 'unavailable'
    throw new AudioCaptureError('unsupported', 'Media capture is not supported in this browser.')
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    cachedStream = stream
    permissionState = 'granted'
    return stream
  } catch (error) {
    const name = error instanceof DOMException ? error.name : (error as { name?: string })?.name ?? ''
    permissionState = name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError'
      ? 'denied'
      : 'unavailable'
    throw errorForUnavailable(name)
  }
}

function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  for (const mime of RECORDER_MIME_CANDIDATES) {
    try {
      if (MediaRecorder.isTypeSupported(mime)) return mime
    } catch {
      // ignore
    }
  }
  return undefined
}

export function createRecordingSession(stream: MediaStream): RecordingSession {
  if (typeof MediaRecorder === 'undefined') {
    throw new AudioCaptureError('unsupported', 'Recording is not supported in this browser.')
  }

  let recorder: MediaRecorder
  const mimeType = pickRecorderMime()
  try {
    recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
  } catch {
    throw new AudioCaptureError('unsupported', 'Recording could not be started.')
  }

  const chunks: Blob[] = []
  recorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) chunks.push(event.data)
  }

  return {
    stop(): Promise<RecordedClip> {
      return new Promise<RecordedClip>((resolve, reject) => {
        recorder.onstop = () => {
          const capturedBlob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' })
          if (capturedBlob.size === 0) {
            reject(new AudioCaptureError('no-audio', 'No audio was captured.'))
            return
          }
          toWav(capturedBlob).then(resolve, reject)
        }
        recorder.onerror = () => {
          reject(new AudioCaptureError('encode', 'Microphone recording failed.'))
        }
        try {
          if (recorder.state === 'recording') recorder.stop()
          else recorder.stop()
        } catch {
          reject(new AudioCaptureError('encode', 'Recording could not be stopped.'))
        }
      })
    },
  }
}

export function releaseMicrophone(): void {
  if (cachedStream) {
    cachedStream.getTracks().forEach(track => {
      try {
        track.stop()
      } catch {
        // ignore
      }
    })
  }
  cachedStream = null
  permissionState = 'unknown'
}

async function toWav(source: Blob): Promise<RecordedClip> {
  let arrayBuffer: ArrayBuffer
  try {
    arrayBuffer = await source.arrayBuffer()
  } catch {
    throw new AudioCaptureError('encode', 'Could not read the recording.')
  }

  const AudioContextCtor = window.AudioContext
    ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) {
    throw new AudioCaptureError('unsupported', 'Audio decoding is not supported in this browser.')
  }

  let decoded: AudioBuffer
  try {
    const decodeContext = new AudioContextCtor()
    try {
      decoded = await decodeContext.decodeAudioData(arrayBuffer)
    } finally {
      void decodeContext.close()
    }
  } catch {
    throw new AudioCaptureError('encode', 'The recorded audio could not be decoded.')
  }

  const sampleCount = Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE))
  const offlineContext = new OfflineAudioContext(1, sampleCount, TARGET_SAMPLE_RATE)
  const sourceNode = offlineContext.createBufferSource()
  sourceNode.buffer = decoded
  sourceNode.connect(offlineContext.destination)
  sourceNode.start(0)

  let rendered: AudioBuffer
  try {
    rendered = await offlineContext.startRendering()
  } catch {
    throw new AudioCaptureError('encode', 'The recording could not be converted.')
  }

  const samples = toPcm16(rendered.getChannelData(0))
  const wav = new Blob([encodeWav(samples, TARGET_SAMPLE_RATE)], { type: 'audio/wav' })
  return { wav, durationMs: Math.round(decoded.duration * 1000) }
}

function toPcm16(channelData: Float32Array): Int16Array {
  const pcm = new Int16Array(channelData.length)
  for (let i = 0; i < channelData.length; i++) {
    const value = Math.max(-1, Math.min(1, channelData[i]))
    pcm[i] = value < 0 ? value * 0x8000 : value * 0x7fff
  }
  return pcm
}

function encodeWav(samples: Int16Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  const writeAscii = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i))
  }

  writeAscii(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeAscii(8, 'WAVE')
  writeAscii(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeAscii(36, 'data')
  view.setUint32(40, samples.length * 2, true)

  for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * 2, samples[i], true)
  return buffer
}