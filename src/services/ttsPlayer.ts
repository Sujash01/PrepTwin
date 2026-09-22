/**
 * Minimal singleton helper for playing backend-synthesized question audio.
 * Only one clip plays at a time; object URLs are always revoked.
 */

let audioElement: HTMLAudioElement | null = null
let objectUrl: string | null = null

function disposeInternal(): void {
  if (audioElement) {
    audioElement.onended = null
    audioElement.onerror = null
    try {
      audioElement.pause()
    } catch {
      // ignore
    }
    audioElement.removeAttribute('src')
    audioElement.load()
    audioElement = null
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

export function stopTtsPlayback(): void {
  disposeInternal()
}

export function playTtsBytes(base64: string, mimeType: string): Promise<void> {
  disposeInternal()

  let bytes: Uint8Array<ArrayBuffer>
  try {
    const binary = atob(base64)
    const buffer = new ArrayBuffer(binary.length)
    bytes = new Uint8Array(buffer)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  } catch {
    return Promise.reject(new Error('audio-parse-failed'))
  }

  return new Promise<void>((resolve, reject) => {
    const blob = new Blob([bytes], { type: mimeType || 'audio/wav' })
    objectUrl = URL.createObjectURL(blob)
    const element = new Audio(objectUrl)
    audioElement = element

    const fail = (error?: unknown) => {
      disposeInternal()
      reject(error ?? new Error('audio-playback-failed'))
    }

    element.onended = () => {
      disposeInternal()
      resolve()
    }
    element.onerror = () => fail()

    let playResult: Promise<void> | undefined
    try {
      playResult = element.play()
    } catch (error) {
      fail(error)
      return
    }
    if (playResult) {
      playResult.catch(error => fail(error))
    }
  })
}