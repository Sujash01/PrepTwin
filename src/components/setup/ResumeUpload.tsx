import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '../../utils/helpers'
import type { ResumeMetadata } from '../../utils/types'
import { Button } from '../ui/Button'

const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export type ResumeUploadStatus = 'idle' | 'processing' | 'ready' | 'error'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

interface ResumeUploadProps {
  resume: ResumeMetadata | null
  status: ResumeUploadStatus
  onFileSelected: (file: File) => void
  onRetry: () => void
  onClear: () => void
  className?: string
}

export function ResumeUpload({ resume, status, onFileSelected, onRetry, onClear, className }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isPdf = (file: File) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  const isDocx = (file: File) =>
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')

  const validateFile = (file: File): string | null => {
    if (!isPdf(file) && !isDocx(file)) {
      return 'Please upload a PDF or DOCX file.'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Please upload a PDF or DOCX file under ${MAX_SIZE_MB} MB.`
    }
    return null
  }

  const handleFile = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    onFileSelected(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  if (status === 'processing') {
    return (
      <div className={cn('rounded-2xl border border-surface-700/50 bg-elevated/60 backdrop-blur-xl p-8 text-center animate-fade-in', className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div aria-hidden="true" className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
            <div className="relative w-12 h-12 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
            </div>
          </div>
          <p className="text-surface-100 font-medium">Preparing your interview...</p>
          <p className="text-sm text-surface-500">Reading your resume so PrepTwin can tailor the questions to you.</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={cn('rounded-2xl border border-surface-700/50 bg-elevated/60 backdrop-blur-xl p-6 animate-fade-in', className)}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-surface-100 font-medium">We couldn't process your resume.</p>
            <p className="mt-1 text-sm text-surface-500">
              You can still continue without it — PrepTwin will base the questions on your profile.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="sm" onClick={onRetry}>Try Again</Button>
              <Button size="sm" variant="ghost" onClick={onClear}>Continue Without Resume</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'ready' && resume) {
    return (
      <div className={cn('rounded-2xl border border-surface-700/50 bg-elevated/60 backdrop-blur-xl p-5 animate-fade-in', className)}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-surface-100 font-medium truncate">{resume.fileName}</p>
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" aria-hidden="true" />
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 font-medium mt-0.5">Resume ready</p>
            <p className="text-xs text-surface-500 mt-0.5">{formatFileSize(resume.fileSize)}</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-2 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label={`Remove ${resume.fileName}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-4 text-sm text-surface-400 leading-relaxed">
          Your resume will be used to personalize your interview.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload your resume. PDF or DOCX, maximum 5 MB."
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
          isDragging
            ? 'border-primary-500 bg-primary-500/10 scale-[1.01]'
            : 'border-surface-700 bg-elevated/40 hover:border-primary-500/50 hover:bg-elevated'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
            <UploadCloud className="w-8 h-8 text-primary-400" aria-hidden="true" />
          </div>
          <p className="text-surface-100 font-medium">Upload your resume</p>
          <p className="text-sm text-surface-500">
            <span className="text-primary-400 underline underline-offset-2">Browse files</span> or drag &amp; drop
          </p>
          <p className="text-xs text-surface-500">PDF or DOCX · Maximum 5 MB</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-700 dark:text-red-300" role="alert">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-surface-500 leading-relaxed">
        Resume is optional. When ready, it will be used to personalize your interview.
      </p>
    </div>
  )
}