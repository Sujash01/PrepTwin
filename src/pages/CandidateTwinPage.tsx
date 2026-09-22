import { useNavigate, Link } from 'react-router-dom'
import {
  Sparkles, Brain, Users, Calendar, ArrowRight, RefreshCw,
  Target, Lightbulb, BarChart2, Play,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { CircularProgress } from '../components/ui/ProgressBar'
import { InsightCard } from '../components/ui/InsightCard'
import { SkillMap } from '../components/twin/SkillMap'
import { useCandidateTwin, useCandidate, useToast } from '../hooks/useApp'
import { formatDate } from '../utils/helpers'
import { cn } from '../utils/helpers'
import { MOCK_CANDIDATE_TWIN } from '../data/mockData'
import type { CandidateTwin } from '../utils/types'

const TWIN_OVERVIEW = [
  { label: 'Technical Knowledge', score: 78, color: 'success' as const },
  { label: 'Communication', score: 74, color: 'primary' as const },
  { label: 'Problem Solving', score: 82, color: 'success' as const },
  { label: 'Confidence', score: 76, color: 'primary' as const },
  { label: 'Adaptability', score: 84, color: 'success' as const },
]

export function CandidateTwinPage() {
  const navigate = useNavigate()
  const { candidateTwin, setCandidateTwin } = useCandidateTwin()
  const { candidate } = useCandidate()
  const showToast = useToast()

  const twin: CandidateTwin = candidateTwin || MOCK_CANDIDATE_TWIN

  const handleViewResults = (_sessionId: string) => {
    showToast('Opening session results...', 'info')
    navigate('/results')
  }

  const handleRefreshTwin = () => {
    setCandidateTwin(twin)
    showToast('Candidate Twin is up to date.', 'success')
  }

  const firstName = candidate?.name?.split(' ')[0] || 'Candidate'

  return (
    <div className="min-h-screen bg-surface-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-12">
          <div>
            <Badge variant="primary" className="mb-4 inline-flex items-center gap-1.5">
              <Brain className="w-3 h-3" />
              Evolving AI Profile
            </Badge>
            <h1 className="text-4xl font-bold text-surface-100 mb-2">Your Candidate Twin</h1>
            <p className="text-surface-400 text-lg">An evolving AI profile based on your interview performance.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefreshTwin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-600 text-surface-300 hover:bg-surface-800 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Update Twin
            </button>
            <Link to="/setup">
              <Button variant="secondary">
                <Play className="w-4 h-4 mr-2" />
                Take New Interview
              </Button>
            </Link>
          </div>
        </div>

        {/* Twin identity card */}
        <Card className="p-8 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/40 to-purple-500/40 blur-2xl animate-pulse-slow" />
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center border border-primary-500/50">
                <Brain className="w-16 h-16 text-primary-300" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-surface-100 mb-2">
                {firstName}'s Interview Twin
              </h2>
              <p className="text-surface-400 max-w-2xl mb-4 leading-relaxed">
                Built from <span className="text-surface-200 font-medium">{twin.interviewHistory.length} interviews</span> and
                {twin.strengths.length} identified strengths, {twin.weaknesses.length} growth areas, and{' '}
                {twin.recommendations.length} personalized recommendations. Updated on {formatDate(twin.lastUpdated)}.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge variant="success">Strong backend fundamentals</Badge>
                <Badge variant="warning">Developing system design</Badge>
                <Badge variant="primary">Highly adaptive learner</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Twin overview */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-100">Twin Overview</h2>
              <p className="text-surface-400">Your key abilities as measured across interviews.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TWIN_OVERVIEW.map(metric => (
              <Card key={metric.label} className="card-hover p-5 text-center">
                <div className="mx-auto mb-3 flex justify-center">
                  <CircularProgress value={metric.score} size="lg" variant={metric.color}>
                    <span className="text-xl font-bold text-surface-100">{metric.score}%</span>
                  </CircularProgress>
                </div>
                <h3 className="font-medium text-surface-200">{metric.label}</h3>
              </Card>
            ))}
          </div>
        </div>

        {/* Skill map */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-100">Skill Map</h2>
              <p className="text-surface-400">How your skills compare across categories — darker = stronger.</p>
            </div>
          </div>
          <SkillMap categories={twin.skillMap} />
        </div>

        {/* Insights */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-100">Twin Insights</h2>
              <p className="text-surface-400">AI discoveries about your interview patterns.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {twin.insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>

        {/* Interview history */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-100">Interview History</h2>
              <p className="text-surface-400">Your previous interview sessions — click to see results.</p>
            </div>
          </div>
          <div className="space-y-3">
            {twin.interviewHistory.map(session => (
              <button
                key={session.id}
                onClick={() => handleViewResults(session.id)}
                className="w-full card-hover p-5 flex items-center gap-4 text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-100">{session.role}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-surface-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(session.date)}</span>
                    <span className="text-surface-700">•</span>
                    <span className="capitalize">{session.type} interview</span>
                    <span className="text-surface-700">•</span>
                    <span>{session.questionCount} questions</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <span className={cn(
                      'text-2xl font-bold',
                      session.score >= 8 ? 'text-green-400' : session.score >= 6 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {session.score.toFixed(1)}
                    </span>
                    <span className="block text-xs text-surface-500">/ 10</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <ArrowRight className="w-5 h-5 text-surface-400 group-hover:text-primary-400 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
            <button
              onClick={() => navigate('/setup')}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-surface-700 hover:border-primary-500/50 hover:bg-primary-500/10 transition-all group"
            >
              <div className="flex items-center justify-center gap-3 text-surface-400 group-hover:text-primary-300">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Take a new interview to evolve your Twin</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateTwinPage