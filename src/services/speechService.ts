const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// TODO: Connect to Azure Speech MCP Server (Speech-to-Text + Text-to-Speech)
// These functions simulate speech processing. Credentials must live in the backend,
// never here or in client code.
export const speechService = {
  // TODO: Replace with Azure Speech-to-Text transcription
  async transcribeAudio(_audioBlob: Blob): Promise<string> {
    await DELAY(2000)
    return 'This is a mock transcription of the candidate\'s spoken answer. In production, this would connect to Azure Speech-to-Text.'
  },

  // TODO: Replace with Azure Text-to-Speech synthesis
  async synthesizeSpeech(_text: string, _voice: string = 'en-US-AriaNeural'): Promise<Blob> {
    await DELAY(1000)
    return new Blob(['mock audio data'], { type: 'audio/mpeg' })
  },

  // TODO: Replace with the backend voice catalog (Azure Neural voices)
  async getVoices(): Promise<string[]> {
    await DELAY(200)
    return ['en-US-AriaNeural', 'en-US-GuyNeural', 'en-US-JennyNeural', 'en-GB-LibbyNeural']
  },
}