import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Trophy, TrendingUp, Target, AlertTriangle, CheckCircle2, Sparkles, FileText,
  BookOpen, Shuffle, ArrowRight, Users, Bot, RotateCcw,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { CircularProgress } from '../components/ui/ProgressBar'
import { ScoreCard } from '../components/ui/ScoreCard'
import { PerformanceChart, type PerformancePoint } from '../components/results/PerformanceChart'
import { StrengthWeaknessList } from '../components/results/StrengthWeaknessList'
import { Modal, ConfirmDialog } from '../components/ui/Modal'
import { useCandidateTwin, useToast } from '../hooks/useApp'
import { cn } from '../utils/helpers'
import type { ScoreBreakdown, Recommendation } from '../utils/types'
import { MOCK_CANDIDATE_TWIN } from '../data/mockData'

const MOCK_PERFORMANCE: PerformancePoint[] = [
  { question: 'Q1', score: 6.2 },
  { question: 'Q2', score: 6.8 },
  { question: 'Q3', score: 7.1 },
  { question: 'Q4', score: 7.8 },
  { question: 'Q5', score: 8.2 },
  { question: 'Q6', score: 7.9 },
  { question: 'Q7', score: 8.5 },
  { question: 'Q8', score: 8.0 },
  { question: 'Q9', score: 8.6 },
  { question: 'Q10', score: 8.3 },
]

const MOCK_SCORES: ScoreBreakdown = {
  technical: 8.1,
  communication: 7.4,
  confidence: 7.8,
  relevance: 8.3,
  structure: 7.2,
  overall: 7.8,
}

const MOCK_STRENGTHS = [
  'REST API knowledge',
  'Python fundamentals',
  'Problem solving',
  'Practical project experience',
]

const MOCK_WEAKNESSES = [
  'Java OOP fundamentals',
  'Authentication/security concepts',
  'Explaining technical decisions',
  'Answer structure',
]

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec1',
    topic: 'Java OOP',
    priority: 'high',
    reason: 'Answers revealed gaps in inheritance and polymorphism. Several follow-up questions on classes and interfaces were difficult.',
    resources: [
      'Effective Java (Joshua Bloch)',
      'Coursera: Java Programming Masterclass',
      'Practice: Implement classic design patterns',
    ],
  },
  {
    id: 'rec2',
    topic: 'JWT Authentication',
    priority: 'medium',
    reason: 'Implemented JWT correctly but could not explain token revocation and common attacks like token replay.',
    resources: [
      'OWASP JWT Cheat Sheet',
      'Auth0: JWT Handbook',
      'Build a token blacklist with Redis',
    ],
  },
  {
    id: 'rec3',
    topic: 'SQL Optimization',
    priority: 'medium',
    reason: 'Understands JOINs but struggles with query plans, indexes, and N+1 problem.',
    resources: [
      'Use The Index, Luke',
      'PostgreSQL EXPLAIN Analyzer',
      'LeetCode SQL 50 track',
    ],
  },
  {
    id: 'rec4',
    topic: 'System Design',
    priority: 'low',
    reason: 'Solid foundation. Needs exposure to large-scale patterns like sharding, caching layers, and backpressure.',
    resources: [
      'Designing Data-Intensive Applications',
      'System Design Primer',
      'Interview prep: Grokking System Design',
    ],
  },
]

const PRIORITY_STYLES: Record<Recommendation['priority'], string> = {
  high: 'bg-red-500/20 text-red-300 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  low: 'bg-green-500/20 text-green-300 border-green-500/30',
}

const PRIORITY_LABELS = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
}

export function ResultsPage() {
  const navigate = useNavigate()
  const { candidateTwin } = useCandidateTwin()
  const showToast = useToast()
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null)
  const [showPracticeConfirm, setShowPracticeConfirm] = useState(false)

  const twin = candidateTwin || MOCK_CANDIDATE_TWIN

  const handleViewTwin = () => {
    navigate('/twin')
  }

  const handlePractice = (rec: Recommendation) => {
    setSelectedRec(rec)
    setShowPracticeConfirm(true)
  }

  const handleNewInterview = () => {
    navigate('/setup')
  }

  const averageOfRecent = ((MOCK_PERFORMANCE[8].score + MOCK_PERFORMANCE[9].score) / 2).toFixed(1)
  const improvement = ((MOCK_PERFORMANCE[9].score - MOCK_PERFORMANCE[0].score)).toFixed(1)

  const scoreCards = [
    { label: 'Technical Accuracy', score: MOCK_SCORES.technical, description: 'Correctness and depth of technical answers' },
    { label: 'Communication', score: MOCK_SCORES.communication, description: 'Clarity and articulation of ideas' },
    { label: 'Confidence', score: MOCK_SCORES.confidence, description: 'Assurance in delivery and responses' },
    { label: 'Relevance', score: MOCK_SCORES.relevance, description: 'How on-topic and focused your answers were' },
    { label: 'Structure', score: MOCK_SCORES.structure, description: 'Organization and flow of responses' },
  ]

  return (
    <div className="min-h-screen bg-surface-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-12">
          <div>
            <Badge variant="primary" className="mb-4 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Interview Report
            </Badge>
            <h1 className="text-4xl font-bold text-surface-100 mb-2">Interview Performance</h1>
            <p className="text-surface-400 text-lg">Here's how you performed during your interview.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/twin">
              <Button variant="secondary">
                <Users className="w-4 h-4 mr-2" />
                View Candidate Twin
              </Button>
            </Link>
            <Button onClick={handleNewInterview}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Interview
            </Button>
          </div>
        </div>

        {/* Overall score + highlight stats */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card className="lg:col-span-1 flex items-center justify-center py-10">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center mb-6">
                <CircularProgress
                  value={MOCK_SCORES.overall * 10}
                  size="xl"
                  strokeWidth={8}
                  variant={MOCK_SCORES.overall >= 8 ? 'success' : MOCK_SCORES.overall >= 6 ? 'warning' : 'danger'}
                  showValue={false}
                >
                  <div className="text-center">
                    <span className="block text-5xl font-bold text-surface-100">{MOCK_SCORES.overall.toFixed(1)}</span>
                    <span className="text-surface-500">/ 10</span>
                  </div>
                </CircularProgress>
              </div>
              <h2 className="text-xl font-semibold text-surface-100 mb-2">Overall Performance</h2>
              <div className="flex items-center justify-center gap-2 text-sm text-green-400 mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>+{improvement} from start</span>
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-sm text-surface-400">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {twin.strengths.length} strengths
                </div>
                <div className="flex items-center gap-1.5 text-sm text-surface-400">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {twin.weaknesses.length} gaps
                </div>
              </div>
              <Button onClick={handleViewTwin}>
                <Users className="w-4 h-4 mr-2" />
                Meet Your Twin
              </Button>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-400">Best Question</p>
                    <p className="text-xl font-bold text-surface-100">Q9 — 8.6</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-400">Recent Average</p>
                    <p className="text-xl font-bold text-surface-100">{averageOfRecent} / 10</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Adaptive Growth</CardTitle>
                    <CardDescription>How the AI adjusted difficulty and how you responded.</CardDescription>
                  </div>
                  <Badge variant="primary">Adaptive Mode</Badge>
                </div>
              </CardHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Difficulty increased</span>
                  <span className="text-surface-100 font-medium">3 times</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Follow-up questions</span>
                  <span className="text-surface-100 font-medium">2 answered well</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Adaptive precision</span>
                  <span className="text-green-400 font-medium">High</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Score cards */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-surface-100">Score Breakdown</h2>
              <p className="text-surface-400">Five dimensions of your interview performance.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {scoreCards.map((score, index) => (
              <ScoreCard key={index} {...score} />
            ))}
          </div>
        </div>

        {/* Performance trend */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Your scored performance across all questions — shows improvement and adaptation.</CardDescription>
            </CardHeader>
            <PerformanceChart data={MOCK_PERFORMANCE} variant="area" height={320} />
          </Card>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <StrengthWeaknessList label="Your Strengths" items={MOCK_STRENGTHS} variant="strength" />
          <StrengthWeaknessList label="Areas to Improve" items={MOCK_WEAKNESSES} variant="weakness" />
        </div>

        {/* Preparation plan */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-100">Your Personalized Preparation Plan</h2>
              <p className="text-surface-400">Focused topics generated from your interview performance.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {INITIAL_RECOMMENDATIONS.map(rec => (
              <Card key={rec.id} className="card-hover p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-surface-100">{rec.topic}</h4>
                </div>
                <Badge className={cn('mb-3 self-start', PRIORITY_STYLES[rec.priority])}>
                  {PRIORITY_LABELS[rec.priority]}
                </Badge>
                <p className="text-sm text-surface-400 mb-4 flex-1 leading-relaxed">{rec.reason}</p>
                <div className="mb-4 space-y-2">
                  {rec.resources.slice(0, 2).map((resource, ri) => (
                    <div key={ri} className="flex items-start gap-2 text-xs text-surface-500">
                      <FileText className="w-3.5 h-3.5 mt-0.5 text-primary-400 shrink-0" />
                      <span className="leading-relaxed">{resource}</span>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" size="sm" onClick={() => handlePractice(rec)} className="w-full">
                  <Shuffle className="w-3.5 h-3.5 mr-2" />
                  Practice
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Responsibility note */}
        <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-700/50 flex items-start gap-3 mb-12">
          <Bot className="w-5 h-5 text-surface-500 mt-0.5 shrink-0" />
          <p className="text-sm text-surface-500 leading-relaxed">
            PrepTwin scores are AI-generated coaching estimates intended for interview practice. They are not professional
            hiring assessments and should not be used as the sole basis for employment decisions.
          </p>
        </div>
      </div>

      {/* Practice modal */}
      <Modal
        isOpen={!!selectedRec}
        onClose={() => setSelectedRec(null)}
        title="Practice Session"
        description={`Focused practice for ${selectedRec?.topic}`}
      >
        {selectedRec && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', PRIORITY_STYLES[selectedRec.priority])}>
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-100">{selectedRec.topic}</h4>
                <p className="text-xs text-surface-500">{PRIORITY_LABELS[selectedRec.priority]}</p>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-surface-300 mb-2">Recommended Resources</h5>
              <ul className="space-y-2">
                {selectedRec.resources.map((resource, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-surface-400">
                    <FileText className="w-4 h-4 mt-0.5 text-primary-400 shrink-0" />
                    <span className="leading-relaxed">{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-surface-700/50 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setSelectedRec(null)}>Close</Button>
              <Button onClick={() => { setSelectedRec(null); showToast('Practice session coming soon.', 'info') }} disabled>
                Start Practice <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showPracticeConfirm}
        onClose={() => setShowPracticeConfirm(false)}
        onConfirm={() => {
          setShowPracticeConfirm(false)
          showToast(`Starting practice for ${selectedRec?.topic}...`, 'success')
        }}
        title="Start Practice"
        message={`Start a focused practice session for ${selectedRec?.topic}?`}
        confirmText="Start"
      />
    </div>
  )
}

export default ResultsPage