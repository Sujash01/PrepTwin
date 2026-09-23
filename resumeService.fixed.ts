import { createRequire } from 'node:module'

/**
 * resumeService
 *
 * The only module in the backend that turns resume files into plain text. It
 * uses local extraction libraries (pdf-parse v2 for PDF, mammoth for DOCX) -
 * the file bytes are never uploaded to a third-party service and no AI is used
 * to extract text.
 *
 * Resume content is treated as untrusted input: it is sanitized, truncated to a
 * bounded size, flagged as untrusted before it is handed to the interviewer
 * context (see foundryService), and full contents are never logged.
 */

export type ResumeErrorKind = 'unsupported-type' | 'no-text' | 'parse-failed'

export class ResumeServiceError extends Error {
  constructor(
    readonly kind: ResumeErrorKind,
    message: string,
  ) {
    super(message)
    this.name = 'ResumeServiceError'
  }
}

const MAX_EXTRACTED_CHARS = 8000
const MIN_READABLE_CHARS = 20

interface PdfDocument {
  getText: () => Promise<{ text: string; pages: Array<{ text: string; num: number }> }>
  destroy: () => Promise<void>
}

/**
 * pdf-parse v2 is built on pdfjs-dist, which expects DOMMatrix/ImageData/Path2D
 * to exist even for pure text extraction (no rendering happens here). In Node,
 * pdfjs-dist normally gets these from the optional native `@napi-rs/canvas`
 * package; when that native binding fails to load (missing prebuilt binary for
 * the platform, restricted/sandboxed environment, etc.) pdfjs-dist logs a
 * warning but pdf-parse still references `DOMMatrix` unconditionally at
 * require-time, which throws a bare ReferenceError and crashes the ENTIRE
 * server before app.listen() ever runs - taking down every route, not just
 * resume upload. These are inert stand-ins (never used for rendering, only so
 * the module loads); real PDF rendering is never performed here, only text
 * extraction, so the stubs never need real behavior.
 */
for (const name of ['DOMMatrix', 'ImageData', 'Path2D'] as const) {
  if (typeof (globalThis as Record<string, unknown>)[name] === 'undefined') {
    ;(globalThis as Record<string, unknown>)[name] = class {}
  }
}

const require = createRequire(import.meta.url)
const { PDFParse } = require('pdf-parse') as {
  PDFParse: new (options: { data: Buffer }) => PdfDocument
}
const mammoth = require('mammoth') as {
  extractRawText: (options: { buffer: Buffer }) => Promise<{ value: string; messages?: unknown[] }>
}

export interface ExtractedResume {
  text: string
  pages?: number
}

export type ResumeFileType = 'pdf' | 'docx'

export function sniffResumeType(buffer: Buffer): ResumeFileType | null {
  if (buffer.length >= 5 && buffer.toString('latin1', 0, 5) === '%PDF-') return 'pdf'
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05) &&
    buffer[3] === 0x04
  ) {
    return 'docx'
  }
  return null
}

function isUnsafeControlChar(code: number): boolean {
  return code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31)
}

export function normalizeResumeText(raw: string): string {
  const cleaned = raw
    .split('')
    .map(char => {
      const code = char.charCodeAt(0)
      return isUnsafeControlChar(code) ? ' ' : char
    })
    .join('')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^--\s*\d+\s+of\s+\d+\s*--$/gm, '')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const limited = cleaned.slice(0, MAX_EXTRACTED_CHARS)
  return limited
}

async function extractPdf(buffer: Buffer): Promise<{ text: string; pages: number }> {
  const document = new PDFParse({ data: buffer })
  try {
    const result = await document.getText()
    return { text: result.text ?? '', pages: result.pages?.length ?? 1 }
  } finally {
    await document.destroy().catch(() => undefined)
  }
}

async function extractDocx(buffer: Buffer): Promise<{ text: string; pages?: number }> {
  const result = await mammoth.extractRawText({ buffer })
  return { text: result.value ?? '' }
}

export async function extractResumeText(
  buffer: Buffer,
  options: { filename?: string },
): Promise<ExtractedResume> {
  const type = sniffResumeType(buffer)

  const filename = options.filename?.trim() ?? ''
  const filenameExt = filename.split('.').pop()?.toLowerCase() ?? ''
  const extensionOk = filename === '' || filenameExt === 'pdf' || filenameExt === 'docx'
  if (!extensionOk) {
    throw new ResumeServiceError('unsupported-type', 'Please upload a PDF or DOCX resume.')
  }

  if (type === null) {
    throw new ResumeServiceError('unsupported-type', 'Please upload a PDF or DOCX resume.')
  }
  if (filename !== '' && ((type === 'pdf' && filenameExt !== 'pdf') || (type === 'docx' && filenameExt !== 'docx'))) {
    throw new ResumeServiceError('unsupported-type', 'The resume type does not match its file extension.')
  }

  let raw: string
  let pages: number | undefined
  try {
    if (type === 'pdf') {
      const parsed = await extractPdf(buffer)
      raw = parsed.text
      pages = parsed.pages
    } else {
      const parsed = await extractDocx(buffer)
      raw = parsed.text
    }
  } catch {
    throw new ResumeServiceError('parse-failed', 'The resume file could not be read.')
  }

  const text = normalizeResumeText(raw)
  if (text.length < MIN_READABLE_CHARS) {
    throw new ResumeServiceError('no-text', "We couldn't extract readable text from this resume.")
  }

  return pages === undefined ? { text } : { text, pages }
}