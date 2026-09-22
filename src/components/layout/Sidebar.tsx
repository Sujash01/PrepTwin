import { Brain, TrendingUp, Target, ChevronRight, CheckCircle, Circle, HelpCircle } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { ProgressBar } from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'
import type { Interview, QuestionCategory } from '../../utils/types'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../data/mockData'

interface SidebarProps {
  interview: Interview | null
  candidate: { role: string; experience: string } | null
  className?: string
}

const CATEGORIES: QuestionCategory[] = ['introduction', 'technical', 'project', 'behavioral', 'final']

function CategoryIcon({ category, status }: { category: QuestionCategory; status: 'completed' | 'current' | 'upcoming' }) {
  const Icon = CATEGORY_ICONS[category]
  const icons = {
    completed: <CheckCircle className="w-4 h-4 text-green-400" />,
    current: <Icon className="w-4 h-4 text-primary-400" />,
    upcoming: <Circle className="w-4 h-4 text-surface-500" />,
  }
  return icons[status]
}

export function Sidebar({ interview, candidate, className }: SidebarProps) {
  if (!interview || !candidate) return null

  const progress = interview.questions.length > 0
    ? ((interview.currentQuestionIndex + 1) / interview.questions.length) * 100
    : 0

  const currentCategory = interview.questions[interview.currentQuestionIndex]?.category || 'introduction'

  return (
    <aside className={cn('fixed left-0 top-16 bottom-0 w-72 glass border-r border-surface-700/50 overflow-y-auto hidden lg:block', className)}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-100">PrepTwin</h1>
            <p className="text-xs text-surface-500">AI Interview Coach</p>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-700/50 space-y-4">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Progress</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-surface-300">Question {interview.currentQuestionIndex + 1} / {interview.questions.length}</span>
              <span className="font-mono text-primary-400">{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} max={100} size="sm" variant="primary" animated />
          </div>
        </div>

        <div className="pt-4 border-t border-surface-700/50 space-y-3">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Interview Info</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-surface-500">Role</p>
              <p className="text-sm font-medium text-surface-100 truncate">{candidate.role}</p>
            </div>
            <div>
              <p className="text-xs text-surface-500">Experience</p>
              <p className="text-sm font-medium text-surface-100">{candidate.experience}</p>
            </div>
            <div>
              <p className="text-xs text-surface-500">Difficulty</p>
              <Badge variant="primary">{interview.config.difficulty}</Badge>
            </div>
            <div>
              <p className="text-xs text-surface-500">Type</p>
              <Badge variant="neutral">{interview.config.type}</Badge>
            </div>
            <div>
              <p className="text-xs text-surface-500">Mode</p>
              <Badge variant={interview.config.mode === 'voice' ? 'primary' : 'neutral'}>
                {interview.config.mode === 'voice' ? 'Voice (Azure Speech)' : 'Text'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-700/50 space-y-2">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Categories</h3>
          <div className="space-y-2">
            {CATEGORIES.map(cat => {
              const isCurrent = cat === currentCategory && interview.status === 'in-progress'
              const isCompleted = interview.questions
                .slice(0, interview.currentQuestionIndex)
                .some(q => q.category === cat)
              const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
              
              return (
                <div
                  key={cat}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200',
                    status === 'current' && 'bg-primary-500/10 border border-primary-500/20'
                  )}
                >
                  <CategoryIcon category={cat} status={status} />
                  <span className={cn(
                    'text-sm font-medium flex-1 truncate',
                    status === 'completed' && 'text-green-400',
                    status === 'current' && 'text-primary-400',
                    status === 'upcoming' && 'text-surface-400'
                  )}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  {status === 'current' && (
                    <ChevronRight className="w-4 h-4 text-primary-400" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {interview.config.difficulty === 'adaptive' && (
          <div className="pt-4 border-t border-surface-700/50">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Adaptive Mode</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-surface-300">Difficulty adjusts based on performance</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-surface-300">Follow-up questions for weak areas</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-surface-300">Real-time feedback after each answer</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}