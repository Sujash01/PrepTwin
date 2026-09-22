import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  RefreshCw, BrainCircuit, User, Mic, Target, Activity, Sparkles,
  ArrowRight, ArrowDown, TrendingUp, MessageSquareText, Brain,
  AudioWaveform, AudioLines, Lock, Scale, Eye, MessageCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LandingNavbar } from '../components/landing/LandingNavbar'
import { HeroPreview } from '../components/landing/HeroPreview'
import { Reveal } from '../components/landing/Reveal'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { AIAvatar } from '../components/ui/Avatar'
import { useInView } from '../hooks/useInView'

const TRUST = [
  { icon: RefreshCw, label: 'Adaptive AI' },
  { icon: Target, label: 'Role-Specific Questions' },
  { icon: Activity, label: 'Real-Time Evaluation' },
  { icon: Sparkles, label: 'Personalized Insights' },
  { icon: Mic, label: 'Voice Interview Ready' },
]

const FEATURES = [
  {
    icon: RefreshCw,
    title: 'Adaptive Interviews',
    description:
      'Questions evolve based on your previous answers, performance, and demonstrated understanding.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Evaluation',
    description:
      'Get structured feedback across technical accuracy, communication, relevance, clarity, confidence, and structure.',
  },
  {
    icon: User,
    title: 'Candidate Twin',
    description:
      'Build a personalized performance profile that reveals your strengths, weaknesses, patterns, and preparation needs.',
  },
  {
    icon: Mic,
    title: 'Voice Interviews',
    description: 'Practice realistic spoken interviews with Azure Speech-powered interaction.',
    badge: 'AZURE SPEECH',
  },
]

const FLOW_STEPS = [
  { icon: MessageSquareText, label: 'Candidate Answer' },
  { icon: BrainCircuit, label: 'AI Evaluation' },
  { icon: Activity, label: 'Performance Signal' },
  { icon: TrendingUp, label: 'Difficulty Adjustment' },
  { icon: Target, label: 'Next Question' },
]

const STEPS = [
  { number: '01', title: 'Build Your Profile', description: 'Tell PrepTwin your target role, experience, skills, and projects.' },
  { number: '02', title: 'Start Your Interview', description: 'Choose your interview type, difficulty, and mode.' },
  { number: '03', title: 'Answer & Adapt', description: 'Answer questions while PrepTwin adjusts the interview in real time.' },
  { number: '04', title: 'Meet Your Twin', description: 'Discover your strengths, weaknesses, performance trends, and next steps.' },
]

const TWIN_METRICS = [
  { label: 'Technical Knowledge', value: 78 },
  { label: 'Communication', value: 74 },
  { label: 'Problem Solving', value: 82 },
  { label: 'Confidence', value: 76 },
  { label: 'Adaptability', value: 84 },
]

const INSIGHTS: Array<{ type: string; tone: 'success' | 'neutral' | 'warning' | 'primary'; text: string }> = [
  { type: 'STRENGTH', tone: 'success', text: 'Strong backend development experience.' },
  { type: 'PATTERN', tone: 'neutral', text: 'Performance improves after follow-up questions.' },
  { type: 'FOCUS AREA', tone: 'warning', text: 'Technical explanations under pressure.' },
  { type: 'RECOMMENDATION', tone: 'primary', text: 'Practice explaining architecture decisions.' },
]

const PRINCIPLES = [
  { icon: Lock, title: 'Privacy', description: 'Candidate information is handled carefully.' },
  { icon: Scale, title: 'Fairness', description: 'Evaluation focuses on job-relevant performance.' },
  { icon: Eye, title: 'Transparency', description: 'AI-generated scores are clearly identified as estimates.' },
]

function TwinBar({ label, value }: { label: string; value: number }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-surface-400">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-700/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-1000 ease-out"
          style={{ width: inView ? `${value}%` : '0%' }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-sm font-semibold text-surface-100">{value}%</span>
    </div>
  )
}

function InsightCard({ type, tone, text }: { type: string; tone: 'success' | 'neutral' | 'warning' | 'primary'; text: string }) {
  return (
    <Card className="h-full">
      <Badge variant={tone} className="mb-3">{type}</Badge>
      <p className="text-sm text-surface-300 leading-relaxed">{text}</p>
    </Card>
  )
}

function FlowNode({ icon: Icon, label, sub }: { icon: LucideIcon; label: string; sub?: string }) {
  return (
    <div className="glass rounded-2xl border border-surface-700/50 w-44 px-5 py-4 text-center shrink-0">
      <Icon className="w-5 h-5 mx-auto mb-2 text-primary-300" />
      <p className="text-sm font-semibold text-surface-100">{label}</p>
      {sub && <p className="text-xs text-surface-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/[0.06] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(124,92,252,0.16),transparent)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
            <Reveal>
              <Badge variant="primary" className="mb-6 inline-flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span className="tracking-[0.18em] text-xs">AI-POWERED INTERVIEW COACH</span>
              </Badge>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-surface-100 leading-[1.08] mb-6">
                Your <span className="text-gradient">Interview Twin</span>.
              </h1>
              <p className="text-lg sm:text-xl font-medium text-surface-200 mb-3">
                Practice smarter. Adapt faster. Interview better.
              </p>
              <p className="text-surface-400 text-base sm:text-lg leading-relaxed max-w-xl mb-9">
                PrepTwin conducts realistic, role-specific interviews, adapts to your performance,
                and builds a personalized profile of your strengths and areas to improve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/setup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Your Interview
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat with PrepTwin
                  </Button>
                </Link>
                <Link to="/twin">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Explore Candidate Twin
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={120} className="lg:pt-4">
              <HeroPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-surface-700/50 bg-surface-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 lg:gap-x-14">
            {TRUST.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-surface-300">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-100 mb-4">
              More than a mock interview.
            </h2>
            <p className="text-lg text-surface-400 max-w-2xl mx-auto">
              PrepTwin analyzes how you answer, not just what you answer.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Reveal key={index} delay={index * 90} className="h-full">
                  <Card className="card-hover h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-surface-100 mb-2">{feature.title}</h3>
                    <p className="text-surface-400 leading-relaxed text-sm">{feature.description}</p>
                    {feature.badge && <Badge variant="neutral" className="mt-4">{feature.badge}</Badge>}
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Adaptive showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-900/30 border-y border-surface-700/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-100 mb-4">
              The interview changes with you.
            </h2>
            <p className="text-lg text-surface-400 max-w-2xl mx-auto">
              PrepTwin doesn't follow a fixed question list. Your previous answers influence what comes next.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <Reveal>
              <Card className="p-6 sm:p-8">
                <h3 className="text-sm font-semibold tracking-widest text-surface-500 mb-6">ADAPTIVE LOOP</h3>
                <div className="flex flex-col items-center gap-2">
                  {FLOW_STEPS.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <Fragment key={step.label}>
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-11 h-11 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary-300" />
                          </div>
                          <span className="text-surface-100 font-medium text-sm">{step.label}</span>
                        </div>
                        {index < FLOW_STEPS.length - 1 && (
                          <ArrowDown className="w-4 h-4 text-surface-600" />
                        )}
                      </Fragment>
                    )
                  })}
                </div>
              </Card>
            </Reveal>

            <div className="space-y-6">
              <Reveal delay={80}>
                <div className="rounded-2xl border border-green-500/25 bg-green-500/[0.04] p-6 sm:p-7">
                  <Badge variant="success" className="mb-5">STRONG ANSWER</Badge>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-surface-400">Technical understanding</span>
                    <span className="text-sm font-semibold text-green-400">Strong</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-surface-700 to-transparent mb-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-400">Next question</span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-green-400">
                      <TrendingUp className="w-4 h-4" /> More difficult
                    </span>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={160}>
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-6 sm:p-7">
                  <Badge variant="warning" className="mb-5">WEAK ANSWER</Badge>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-surface-400">Technical understanding</span>
                    <span className="text-sm font-semibold text-amber-400">Needs improvement</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-surface-700 to-transparent mb-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-400">Next question</span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-400">
                      <RefreshCw className="w-4 h-4" /> Foundational follow-up
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-100 mb-4">
              From preparation to confidence.
            </h2>
            <p className="text-lg text-surface-400 max-w-2xl mx-auto">
              A simple path to a sharper, more confident interview.
            </p>
          </Reveal>
          <div className="relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary-500/40 via-surface-600 to-primary-500/40" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {STEPS.map((step, index) => (
                <Reveal key={index} delay={index * 90}>
                  <div className="text-center">
                    <div className="relative mx-auto w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 border border-primary-500/30 flex items-center justify-center">
                      <span className="text-2xl font-bold text-surface-100">{step.number}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-100 mb-2">{step.title}</h3>
                    <p className="text-sm text-surface-400 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Twin showcase */}
      <section id="candidate-twin" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-900/30 border-y border-surface-700/50 relative overflow-x-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_70%_40%,rgba(124,92,252,0.12),transparent)]" />
        <div className="relative max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-100 mb-4">
              Meet your Candidate Twin.
            </h2>
            <p className="text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
              Every interview makes your profile smarter. Your Candidate Twin turns interview
              performance into a personalized map of your technical and communication strengths.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-5 gap-10 items-center">
            <Reveal className="lg:col-span-2">
              <Card className="p-6 sm:p-7">
                <div className="flex items-center gap-3 mb-6">
                  <AIAvatar size="sm" />
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-surface-500">YOUR CANDIDATE TWIN</p>
                    <p className="text-sm text-primary-400">Updated after every interview</p>
                  </div>
                </div>
                <div className="space-y-5">
                  {TWIN_METRICS.map(metric => (
                    <TwinBar key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                </div>
              </Card>
            </Reveal>

            <div className="lg:col-span-3 grid sm:grid-cols-2 gap-5">
              {INSIGHTS.map((insight, index) => (
                <Reveal key={insight.type} delay={index * 90} className="h-full">
                  <InsightCard type={insight.type} tone={insight.tone} text={insight.text} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Voice interviews */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <Badge variant="primary" className="mb-6 inline-flex items-center gap-2">
              <AudioWaveform className="w-3 h-3" />
              <span className="tracking-[0.18em] text-xs">POWERED BY AZURE SPEECH</span>
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-100 mb-4">
              Practice like it's the real thing.
            </h2>
            <p className="text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
              Move beyond typing. PrepTwin is designed for realistic spoken interviews, using Azure
              Speech for speech-to-text and text-to-speech interaction.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-3 lg:gap-4 flex-wrap">
              {[
                { icon: Mic, label: 'Candidate speaks', sub: 'Speech input' },
                { icon: AudioWaveform, label: 'Azure Speech', sub: 'Speech-to-Text & TTS' },
                { icon: Brain, label: 'PrepTwin Agent', sub: 'AI interviewer' },
                { icon: Sparkles, label: 'AI response', sub: 'Evaluation' },
                { icon: AudioLines, label: 'Interviewer speaks', sub: 'TTS output' },
              ].map((node, index, arr) => {
                const Icon = node.icon
                return (
                  <Fragment key={index}>
                    <FlowNode icon={Icon} label={node.label} sub={node.sub} />
                    {index < arr.length - 1 && <ArrowRight className="hidden lg:block w-5 h-5 text-surface-600" />}
                    {index < arr.length - 1 && <ArrowDown className="lg:hidden w-5 h-5 text-surface-600" />}
                  </Fragment>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Responsible AI */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-900/30 border-y border-surface-700/50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="max-w-3xl mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-100 mb-4">
              Built for coaching, not hiring decisions.
            </h2>
            <p className="text-lg text-surface-400 leading-relaxed mb-4">
              PrepTwin evaluates interview performance to help candidates practice and improve.
            </p>
            <p className="text-surface-400 leading-relaxed">
              Its scores are AI-generated coaching estimates, not professional hiring assessments.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {PRINCIPLES.map((principle, index) => {
              const Icon = principle.icon
              return (
                <Reveal key={index} delay={index * 90}>
                  <Card className="h-full">
                    <div className="w-11 h-11 rounded-xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-100 mb-2">{principle.title}</h3>
                    <p className="text-sm text-surface-400 leading-relaxed">{principle.description}</p>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary-500/25 bg-gradient-to-br from-primary-500/15 via-surface-900 to-surface-950 p-10 sm:p-16 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_-20%,rgba(124,92,252,0.2),transparent)]" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-100 mb-4">
                  Ready to meet your interview twin?
                </h2>
                <p className="text-lg text-surface-400 mb-10">
                  Start practicing with an interview that adapts to you.
                </p>
                <Link to="/setup">
                  <Button size="lg" className="px-10">
                    Start Your Interview
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-surface-100">PrepTwin</span>
              </div>
              <p className="text-sm text-surface-500">Your AI Interview Twin.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-300 mb-4">Links</p>
              <ul className="space-y-2.5 text-sm text-surface-500">
                <li><a href="#features" className="hover:text-surface-100 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-surface-100 transition-colors">How It Works</a></li>
                <li><a href="#candidate-twin" className="hover:text-surface-100 transition-colors">Candidate Twin</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-300 mb-4">Product</p>
              <ul className="space-y-2.5 text-sm text-surface-500">
                <li><Link to="/interview" className="hover:text-surface-100 transition-colors">Interview</Link></li>
                <li><Link to="/chat" className="hover:text-surface-100 transition-colors">Chat</Link></li>
                <li><Link to="/results" className="hover:text-surface-100 transition-colors">Results</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-surface-700/50 text-center text-xs text-surface-600">
            © 2026 PrepTwin. Built for AI-powered interview practice.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage