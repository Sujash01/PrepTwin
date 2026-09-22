import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'
import { Badge } from '../ui/Badge'
import { AIAvatar } from '../ui/Avatar'
import type { Question } from '../../utils/types'
import { CATEGORY_LABELS, DIFFICULTY_COLORS } from '../../data/mockData'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  isAIThinking?: boolean
  className?: string
}

export const QuestionCard = forwardRef<HTMLDivElement, QuestionCardProps>(
  ({ question, questionNumber, totalQuestions, isAIThinking, className }, ref) => {
    return (
      <div ref={ref} className={cn('animate-fade-in', className)}>
        <div className="flex items-center gap-4 mb-6">
          <AIAvatar size="md" speaking={isAIThinking} />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium text-red-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE INTERVIEW
              </span>
              <Badge variant="primary" size="sm">AI Interviewer</Badge>
            </div>
            <p className="text-xs text-surface-500">
              {isAIThinking ? 'AI is thinking...' : `Question ${questionNumber} of ${totalQuestions}`}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-700/50 bg-surface-900/50 backdrop-blur-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-300 text-xs font-medium">
              Question {questionNumber}
            </span>
            <Badge variant="neutral" size="sm">{CATEGORY_LABELS[question.category]}</Badge>
            <span className={cn('px-3 py-1 rounded-lg text-xs font-medium border', DIFFICULTY_COLORS[question.difficulty])}>
              {question.difficulty}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-surface-100 leading-relaxed">
            &ldquo;{question.text}&rdquo;
          </h2>
          {isAIThinking && (
            <div className="mt-4 flex items-center gap-1 text-primary-400 text-sm">
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="ml-2">Formulating next question...</span>
            </div>
          )}
        </div>
      </div>
    )
  }
)

QuestionCard.displayName = 'QuestionCard'