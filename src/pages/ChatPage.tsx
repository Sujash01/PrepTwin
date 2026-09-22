import { useEffect, useRef, useState } from 'react'
import {
  Brain, Send, RefreshCw, Sparkles, ArrowUpRight,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { cn } from '../utils/helpers'
import { chatApi } from '../services/chatApi'
import { useToast } from '../hooks/useApp'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  failed?: boolean
}

const STARTERS = [
  'How do I prepare for behavioral questions?',
  'Give me a system design practice question',
  'What should a strong resume highlight?',
  'Give me feedback on my answer approach',
]

const DISCLAIMER = 'PrepTwin provides AI coaching feedback, not hiring decisions.'
const ERROR_TEXT = "PrepTwin couldn't respond right now."

function makeId(): string {
  return Math.random().toString(36).slice(2)
}

function PrepTwinAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 text-white',
        className,
      )}
      aria-hidden="true"
    >
      <Brain className="w-1/2 h-1/2" />
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-slide-up" role="status" aria-label="PrepTwin is responding">
      <PrepTwinAvatar className="w-8 h-8 shrink-0" />
      <div className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl rounded-bl-md bg-surface-800 border border-surface-700/60">
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

function ErrorBubble({ onRetry, disabled }: { onRetry: () => void; disabled: boolean }) {
  return (
    <div className="flex items-start gap-3 animate-slide-up">
      <PrepTwinAvatar className="w-8 h-8 shrink-0 mt-0.5" />
      <div className="rounded-2xl rounded-bl-md border border-red-500/30 bg-red-500/5 px-4 py-3">
        <p className="text-sm text-ink">{ERROR_TEXT}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={onRetry}
          disabled={disabled}
          aria-label="Retry sending your message"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    </div>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-md border border-primary-500/20 bg-primary-500/10 text-sm leading-relaxed text-ink whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 animate-slide-up max-w-[85%]">
      <PrepTwinAvatar className="w-8 h-8 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="mb-1 text-xs font-medium text-surface-500">PrepTwin</p>
        <p className="text-sm sm:text-[15px] leading-relaxed text-ink whitespace-pre-wrap">
          {message.text}
        </p>
      </div>
    </div>
  )
}

function EmptyState({
  onStarter,
  disabled,
}: {
  onStarter: (text: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-7 text-center">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center border border-primary-500/30">
        <Sparkles className="w-8 h-8 text-primary-500" />
      </div>
      <div className="max-w-md">
        <h2 className="text-xl sm:text-2xl font-semibold text-ink">
          How can PrepTwin help you today?
        </h2>
        <p className="mt-2 text-sm sm:text-[15px] text-surface-500">
          Practice interviews, improve your answers, prepare for technical rounds, or build a
          smarter interview strategy.
        </p>
      </div>
      <div className="grid w-full max-w-xl grid-cols-1 sm:grid-cols-2 gap-3">
        {STARTERS.map(starter => (
          <button
            key={starter}
            type="button"
            onClick={() => onStarter(starter)}
            disabled={disabled}
            className="group flex items-center justify-between gap-3 rounded-xl border border-surface-700 bg-surface-800 px-4 py-3 text-left text-sm text-ink transition-all hover:border-primary-500/60 hover:bg-primary-500/5 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="min-w-0 flex-1">{starter}</span>
            <ArrowUpRight className="w-4 h-4 shrink-0 text-surface-500 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600 dark:group-hover:text-primary-300" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [mode, setMode] = useState<string | null>(null)
  const [failedId, setFailedId] = useState<string | null>(null)
  const [failedText, setFailedText] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const showToast = useToast()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending])

  useEffect(() => {
    const element = textareaRef.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 128)}px`
  }, [input])

  const handleSend = async (text: string, kind: 'new' | 'retry' = 'new') => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    const replacingFailedId = failedId
    setFailedId(null)
    setFailedText(null)
    setInput('')
    setSending(true)

    if (kind === 'new') {
      setMessages(prev => [...prev, { id: makeId(), role: 'user', text: trimmed }])
    }

    try {
      const result = await chatApi.sendMessage(sessionId, trimmed)
      setSessionId(result.sessionId)
      setMode(result.mode ?? null)
      setMessages(prev => {
        const base = replacingFailedId
          ? prev.filter(message => message.id !== replacingFailedId)
          : prev
        return [...base, { id: makeId(), role: 'assistant', text: result.reply }]
      })
    } catch {
      const errorId = makeId()
      setFailedId(errorId)
      setFailedText(trimmed)
      setMessages(prev => [
        ...prev,
        { id: errorId, role: 'assistant', text: '', failed: true },
      ])
      showToast(ERROR_TEXT, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setSessionId(null)
    setMode(null)
    setFailedId(null)
    setFailedText(null)
    setInput('')
  }

  const empty = messages.length === 0
  const canSend = input.trim().length > 0 && !sending

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-surface-950">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-surface-700/60 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <PrepTwinAvatar className="w-10 h-10 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold text-ink">PrepTwin Chat</h1>
              {mode && (
                <Badge variant={mode === 'foundry' ? 'success' : 'neutral'} size="sm">
                  {mode === 'foundry' ? 'Foundry agent' : 'Local preview'}
                </Badge>
              )}
            </div>
            <p className="hidden sm:block text-xs text-surface-500">
              AI Interview Coach
              <span className="mx-1.5 text-surface-400">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden="true" />
                Ready to help
              </span>
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleNewChat}
          disabled={sending}
          aria-label="Start a new chat"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New chat
        </Button>
      </header>

      {/* Chat area */}
      <section className="flex-1 overflow-y-auto">
        <div
          className={cn(
            'mx-auto flex w-full max-w-[960px] flex-col px-4 sm:px-8',
            empty ? 'justify-center py-8' : 'gap-6 py-6',
            'min-h-full',
          )}
        >
          {empty ? (
            <EmptyState onStarter={text => handleSend(text)} disabled={sending} />
          ) : (
            messages.map(message =>
              message.failed ? (
                <ErrorBubble
                  key={message.id}
                  onRetry={() => handleSend(failedText ?? '', 'retry')}
                  disabled={sending}
                />
              ) : (
                <ChatBubble key={message.id} message={message} />
              )
            )
          )}

          {sending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </section>

      {/* Composer */}
      <footer className="shrink-0 border-t border-surface-700/60 bg-surface-900/70 backdrop-blur-sm px-4 sm:px-8 py-4">
        <div className="mx-auto w-full max-w-[960px]">
          <form
            className="flex items-end gap-2 rounded-2xl border border-surface-700 bg-surface-800 px-3 py-2 shadow-sm transition-colors focus-within:border-primary-500/60 focus-within:ring-2 focus-within:ring-primary-500/20"
            onSubmit={event => {
              event.preventDefault()
              handleSend(input)
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend(input)
                }
              }}
              rows={1}
              aria-label="Message PrepTwin"
              placeholder="Ask PrepTwin anything..."
              className="max-h-32 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-ink placeholder-surface-500 focus:outline-none"
            />
            <Button
              type="submit"
              size="md"
              className="h-10 w-10 shrink-0 rounded-xl px-0"
              disabled={!canSend}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="mt-3 pb-1 text-center text-xs text-surface-500">{DISCLAIMER}</p>
        </div>
      </footer>
    </div>
  )
}

export default ChatPage