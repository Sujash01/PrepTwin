import { speechApi } from './speechApi'

const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const speechService = {
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      await DELAY(2000)
      return "This is a mock transcription of the candidate's spoken answer. In production, this would connect to Azure Speech-to-Text."
    }
    return speechApi.transcribe(audioBlob)
  },

  async synthesizeSpeech(text: string, _voice = 'en-US-AriaNeural'): Promise<Blob> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      await DELAY(1000)
      return new Blob(['mock audio data'], { type: 'audio/mpeg' })
    }
    const result = await speechApi.synthesize(text)
    const binary = atob(result.audioBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new Blob([bytes], { type: result.mimeType || 'audio/wav' })
  },

  async getVoices(): Promise<string[]> {
    await DELAY(200)
    return ['en-US-AriaNeural', 'en-US-GuyNeural', 'en-US-JennyNeural', 'en-GB-LibbyNeural']
  },
}