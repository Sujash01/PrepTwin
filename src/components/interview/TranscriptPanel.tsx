import { useState, useRef, useEffect } from 'react'
import { Mic, Pencil, Check, X, Loader2 } from 'lucide-react'
import { cn } from '../../utils/helpers'

interface TranscriptPanelProps {
  transcript: string
  onTranscriptChange: (text: string) => void
  isListening?: boolean
  isProcessing?: boolean
  editable?: boolean
  className?: string
}

export function TranscriptPanel({
  transcript,
  onTranscriptChange,
  isListening,
  isProcessing,
  editable = true,
  className,
}: TranscriptPanelProps) {
  const [isEditing, setIsEditing] = useState(!transcript)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    if (transcript) {
      setIsEditing(false)
    }
  }, [transcript])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDone = () => {
    setIsEditing(false)
  }

  return (
    <div className={cn('rounded-2xl border border-surface-700/50 bg-surface-900/50 backdrop-blur-xl overflow-hidden', className)}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-700/50">
        <div className="flex items-center gap-2">
          {isListening ? (
            <>
              <Mic className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-sm font-medium text-red-400">Listening...</span>
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
              <span className="text-sm font-medium text-primary-400">AI is analyzing your answer...</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-surface-400" />
              <span className="text-sm font-medium text-surface-300">Your response</span>
            </>
          )}
        </div>
        {editable && !isEditing && transcript && (
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-400 hover:text-primary-400 transition-colors p-1.5 rounded-lg hover:bg-surface-800"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>

      <div className="p-5">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={transcript}
              onChange={e => onTranscriptChange(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              placeholder={isListening ? 'Your speech is being captured...' : 'Your answer will appear here...'}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  onTranscriptChange('')
                  handleEdit()
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
              <button
                onClick={handleDone}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Done
              </button>
            </div>
          </div>
        ) : transcript ? (
          <blockquote className="pl-4 border-l-2 border-primary-500/50 text-surface-200 leading-relaxed">
            &ldquo;{transcript}&rdquo;
          </blockquote>
        ) : (
          <div className="text-center py-8">
            {isListening ? (
              <div className="flex items-center justify-center gap-1" aria-hidden="true">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-red-400 animate-pulse"
                    style={{ height: `${8 + Math.random() * 32}px`, animationDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>
            ) : isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <p className="text-sm text-surface-500">
                {editable ? 'Your answer will appear here.' : 'No response yet.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}