export type InterviewFocus = 'technical' | 'behavioral' | 'system-design' | 'projects' | 'mixed'

export interface ResumeMetadata {
  fileName: string
  fileSize: number
  fileType: string
  /** Opaque server-side token referencing temporarily stored extracted resume text. */
  resumeId?: string
  processed?: boolean
}

export interface ResumeData {
  fileName: string
  fileSize: number
  fileType: string
  resumeId?: string
  processed?: boolean
  skillsDetected: string[]
  projectsDetected: string[]
  experienceDetected: string[]
  parsedAt: Date
}

export interface Candidate {
  id: string
  name: string
  email?: string
  role: string
  experience: string
  skills: string[]
  focus: InterviewFocus
  resume: ResumeData | ResumeMetadata | null
  createdAt: Date
}

export interface CandidateProfile {
  id: string
  name: string
  role: string
  experience: string
  skills: string[]
  focus: InterviewFocus
  resume: ResumeMetadata | null
  createdAt: Date
}

export type InterviewType = 'technical' | 'behavioral' | 'mixed' | 'project-based'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'adaptive'
export type InterviewMode = 'text' | 'voice'
export type QuestionCategory = 'introduction' | 'technical' | 'project' | 'behavioral' | 'final'

export interface InterviewConfig {
  type: InterviewType
  difficulty: Difficulty
  questionCount: 5 | 10 | 15
  mode: InterviewMode
}

export interface Question {
  id: string
  text: string
  category: QuestionCategory
  difficulty: Difficulty
  expectedTopics: string[]
  followUpQuestions?: string[]
}

export interface Answer {
  id: string
  questionId: string
  text: string
  timestamp: Date
  duration: number
  isSkipped: boolean
}

export interface Evaluation {
  id: string
  questionId: string
  answerId: string
  technical: number
  relevance: number
  clarity: number
  structure: number
  confidence: number
  feedback: string
  reasoning: string
  difficultyAdjustment: 'increase' | 'maintain' | 'decrease'
  createdAt: Date
}

export interface Interview {
  id: string
  candidateId: string
  config: InterviewConfig
  questions: Question[]
  answers: Answer[]
  evaluations: Evaluation[]
  currentQuestionIndex: number
  status: 'setup' | 'in-progress' | 'completed' | 'paused'
  startedAt: Date | null
  completedAt: Date | null
}

export interface ScoreBreakdown {
  technical: number
  communication: number
  confidence: number
  relevance: number
  structure: number
  overall: number
}

export interface CandidateTwin {
  id: string
  candidateId: string
  scores: ScoreBreakdown
  skillMap: SkillCategory[]
  strengths: string[]
  weaknesses: string[]
  insights: TwinInsight[]
  recommendations: Recommendation[]
  interviewHistory: InterviewSummary[]
  lastUpdated: Date
}

export interface SkillCategory {
  name: string
  score: number
  skills: SkillItem[]
}

export interface SkillItem {
  name: string
  proficiency: number
  category: string
}

export interface TwinInsight {
  id: string
  type: 'strength' | 'weakness' | 'pattern' | 'recommendation'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export interface Recommendation {
  id: string
  topic: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  resources: string[]
}

export interface InterviewSummary {
  id: string
  role: string
  date: Date
  score: number
  questionCount: number
  type: InterviewType
}

export interface AdaptiveIndicator {
  previousPerformance: 'excellent' | 'good' | 'average' | 'below-average'
  technicalUnderstanding: 'strong' | 'moderate' | 'developing'
  nextDifficulty: 'increasing' | 'maintaining' | 'decreasing'
  reason: string
}

export interface MicroFeedback {
  technical: number
  relevance: number
  clarity: number
  structure: number
  confidence: number
}