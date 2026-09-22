import type {
  Candidate,
  Interview,
  InterviewConfig,
  Question,
  Answer,
  Evaluation,
  CandidateTwin,
} from '../utils/types'
import { MOCK_QUESTIONS, MOCK_EVALUATIONS, MOCK_CANDIDATE_TWIN } from '../data/mockData'
import { generateId } from '../utils/helpers'

const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// TODO: Connect to backend / Microsoft Foundry Agent Service (PrepTwin-Interviewer + GPT-4.1-mini)
// These functions currently simulate the agent with mock data. They must not hold credentials.
export const agentService = {
  // TODO: Replace with backend interview creation endpoint
  async startInterview(candidate: Candidate, config: InterviewConfig): Promise<Interview> {
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
  },

  // TODO: Replace with backend answer-submission endpoint that returns an Evaluation
  async sendAnswer(interviewId: string, answer: Answer): Promise<Evaluation> {
    await DELAY(1500)

    const interview = getMockInterview(interviewId)
    const question = interview.questions[interview.currentQuestionIndex]

    let evaluation: Evaluation
    const text = answer.text.toLowerCase()

    if (text.length > 100 && (text.includes('jwt') || text.includes('auth') || text.includes('token'))) {
      evaluation = { ...MOCK_EVALUATIONS.strong, id: generateId(), questionId: question.id, answerId: answer.id }
    } else if (text.length > 50) {
      evaluation = { ...MOCK_EVALUATIONS.moderate, id: generateId(), questionId: question.id, answerId: answer.id }
    } else {
      evaluation = { ...MOCK_EVALUATIONS.weak, id: generateId(), questionId: question.id, answerId: answer.id }
    }

    return evaluation
  },

  // TODO: Replace with backend adaptive next-question endpoint
  async getNextQuestion(_interviewId: string): Promise<Question | null> {
    await DELAY(500)

    const interview = getMockInterview(_interviewId)
    const nextIndex = interview.currentQuestionIndex + 1

    if (nextIndex >= interview.questions.length) {
      return null
    }

    return interview.questions[nextIndex]
  },

  async evaluateAnswer(_interviewId: string, _answerId: string): Promise<Evaluation> {
    await DELAY(1000)
    return MOCK_EVALUATIONS.moderate
  },

  // TODO: Replace with backend session-completion endpoint that builds the Candidate Twin
  async endInterview(_interviewId: string): Promise<CandidateTwin> {
    await DELAY(1000)
    return MOCK_CANDIDATE_TWIN
  },

  // TODO: Replace with backend Candidate Twin retrieval endpoint
  async getCandidateTwin(_candidateId: string): Promise<CandidateTwin> {
    await DELAY(600)
    return MOCK_CANDIDATE_TWIN
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