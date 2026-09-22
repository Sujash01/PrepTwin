/**
 * Frontend speech facade.
 *
 * Clean typed entry points for the interview's voice mode. No Azure
 * credentials ever live here — every call is proxied to the server-side
 * Azure AI Speech endpoints:
 *
 *   POST /api/speech/transcribe   (WAV in, text out)
 *   POST /api/speech/synthesize   (text in, WAV audio out)
 *   GET  /api/speech/status       (is Speech configured on the server?)
 *
 * The transport layer is `speechApi`; this module keeps the component layer
 * decoupled from HTTP details.
 */
import { speechApi, type TtsAudio } from './speechApi'

export interface SpeechStatus {
  configured: boolean
}

export const speechService = {
  async transcribeAudio(wav: Blob): Promise<string> {
    return speechApi.transcribe(wav)
  },

  async synthesizeSpeech(text: string): Promise<TtsAudio> {
    return speechApi.synthesize(text)
  },

  async getSpeechStatus(): Promise<SpeechStatus> {
    return speechApi.getStatus()
  },
}