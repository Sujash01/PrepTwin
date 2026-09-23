import type {
  Candidate,
  Interview,
  InterviewConfig,
  Question,
  Answer,
  Evaluation,
  CandidateTwin,
  Difficulty,
  QuestionCategory,
} from '../utils/types'
import { MOCK_QUESTIONS, MOCK_EVALUATIONS, MOCK_CANDIDATE_TWIN } from '../data/mockData'
import { generateId } from '../utils/helpers'
import { interviewApi, type SessionSummaryResponse } from './interviewApi'

const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function mapSummaryToCandidateTwin(candidateId: string, summary: SessionSummaryResponse): CandidateTwin {
  return {
    id: `twin-${summary.sessionId}`,
    candidateId,
    scores: {
      technical: summary.overallScores.technical / 10,
      communication: summary.overallScores.communication / 10,
      confidence: summary.overallScores.confidence / 10,
      relevance: summary.overallScores.relevance / 10,
      structure: summary.overallScores.structure / 10,
      overall: summary.averageScore / 10,
    },
    skillMap: summary.categoryScores.map(c => ({
      name: c.category,
      score: c.score * 10,
      skills: [
        { name: c.category, proficiency: c.score * 10, category: c.category },
      ],
    })),
    strengths: summary.strengths,
    weaknesses: summary.improvements,
    insights: [
      {
        id: generateId(),
        type: summary.strengths.length > 0 ? 'strength' : 'pattern',
        title: 'Performance Insight',
        description: `Overall average score of ${(summary.averageScore / 10).toFixed(1)}/10. Trend: ${summary.performanceTrend}.`,
        priority: 'high',
      },
    ],
    recommendations: summary.improvements.map((imp, idx) => ({
      id: `rec-${idx}`,
      topic: imp,
      priority: 'medium',
      reason: 'Identified during interview session coaching analysis.',
      resources: [],
    })),
    interviewHistory: [
      {
        id: summary.sessionId,
        role: 'Simulated Interview',
        date: new Date(),
        score: Math.round(summary.averageScore / 10),
        questionCount: summary.questionsAnswered,
        type: 'mixed',
      },
    ],
    lastUpdated: new Date(),
  }
}

export const agentService = {
  async startInterview(candidate: Candidate, config: InterviewConfig): Promise<Interview> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      await DELAY(800)
      const questions = MOCK_QUESTIONS[config.type] || MOCK_QUESTIONS.mixed
      const selectedQuestions = questions.slice(0, config.questionCount)

      return {
        id: generateId(),
        candidateId: candidate.id,
        config,
        questions: selectedQuestions,
        answers: [],
        evaluations: [],
        currentQuestionIndex: 0,
        status: 'in-progress',
        startedAt: new Date(),
        completedAt: null,
      }
    }

    const response = await interviewApi.startInterview({
      name: candidate.name,
      role: candidate.role,
      experience: candidate.experience,
      skills: candidate.skills,
      focus: candidate.focus,
      resumeId: candidate.resume?.resumeId,
    })

    const initialQuestion: Question = {
      id: generateId(),
      text: response.question.text,
      category: 'technical' as QuestionCategory,
      difficulty: 'adaptive' as Difficulty,
      expectedTopics: response.question.topic ? [response.question.topic] : [],
    }

    return {
      id: response.sessionId,
      candidateId: candidate.id,
      config,
      questions: [initialQuestion],
      answers: [],
      evaluations: [],
      currentQuestionIndex: 0,
      status: 'in-progress',
      startedAt: new Date(),
      completedAt: null,
    }
  },

  async sendAnswer(interviewId: string, answer: Answer): Promise<Evaluation> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      await DELAY(1500)
      const interview = getMockInterview(interviewId)
      const question = interview.questions[interview.currentQuestionIndex]

      const text = answer.text.toLowerCase()
      if (text.length > 100 && (text.includes('jwt') || text.includes('auth') || text.includes('token'))) {
        return { ...MOCK_EVALUATIONS.strong, id: generateId(), questionId: question.id, answerId: answer.id }
      } else if (text.length > 50) {
        return { ...MOCK_EVALUATIONS.moderate, id: generateId(), questionId: question.id, answerId: answer.id }
      } else {
        return { ...MOCK_EVALUATIONS.weak, id: generateId(), questionId: question.id, answerId: answer.id }
      }
    }

    const response = await interviewApi.sendMessage(interviewId, answer.text)
    return {
      id: generateId(),
      questionId: answer.questionId,
      answerId: answer.id,
      technical: 7,
      relevance: 7,
      clarity: 7,
      structure: 7,
      confidence: 7,
      feedback: response.feedback?.status === 'analyzed'
        ? 'Answer analyzed.'
        : 'Feedback pending summary.',
      reasoning: 'Evaluation recorded server-side for summary aggregation.',
      difficultyAdjustment: 'maintain',
      createdAt: new Date(),
    }
  },

  async getNextQuestion(_interviewId: string): Promise<Question | null> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      await DELAY(500)
      const interview = getMockInterview(_interviewId)
      const nextIndex = interview.currentQuestionIndex + 1
      if (nextIndex >= interview.questions.length) {
        return null
      }
      return interview.questions[nextIndex]
    }
    return null
  },

  async evaluateAnswer(_interviewId: string, _answerId: string): Promise<Evaluation> {
    await DELAY(1000)
    return MOCK_EVALUATIONS.moderate
  },

  async endInterview(interviewId: string): Promise<CandidateTwin> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      await DELAY(1000)
      return MOCK_CANDIDATE_TWIN
    }
    const summary = await interviewApi.fetchSummary(interviewId)
    return mapSummaryToCandidateTwin(interviewId, summary)
  },

  async getCandidateTwin(candidateId: string): Promise<CandidateTwin> {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      await DELAY(600)
      return MOCK_CANDIDATE_TWIN
    }
    try {
      const summary = await interviewApi.fetchSummary(candidateId)
      return mapSummaryToCandidateTwin(candidateId, summary)
    } catch {
      return MOCK_CANDIDATE_TWIN
    }
  },
}

function getMockInterview(id: string): Interview {
  return {
    id,
    candidateId: 'candidate1',
    config: {
      type: 'mixed',
      difficulty: 'adaptive',
      questionCount: 10,
      mode: 'text',
    },
    questions: MOCK_QUESTIONS.mixed,
    answers: [],
    evaluations: [],
    currentQuestionIndex: 0,
    status: 'in-progress',
    startedAt: new Date(),
    completedAt: null,
  }
}