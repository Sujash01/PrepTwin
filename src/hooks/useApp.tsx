import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Candidate, Interview, Question, Answer, Evaluation, CandidateTwin } from '../utils/types'

interface AppState {
  candidate: Candidate | null
  interview: Interview | null
  currentQuestion: Question | null
  currentAnswer: string
  isRecording: boolean
  isProcessing: boolean
  showMicroFeedback: boolean
  lastEvaluation: Evaluation | null
  candidateTwin: CandidateTwin | null
  toast: Toast | null
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMessage {
  message: string
  type: ToastType
}

type Toast = ToastMessage | null

type Action =
  | { type: 'SET_CANDIDATE'; payload: Candidate }
  | { type: 'SET_INTERVIEW'; payload: Interview }
  | { type: 'SET_CURRENT_QUESTION'; payload: Question }
  | { type: 'SET_CURRENT_ANSWER'; payload: string }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_SHOW_MICRO_FEEDBACK'; payload: boolean }
  | { type: 'SET_LAST_EVALUATION'; payload: Evaluation | null }
  | { type: 'ADD_ANSWER'; payload: Answer }
  | { type: 'ADD_EVALUATION'; payload: Evaluation }
  | { type: 'NEXT_QUESTION' }
  | { type: 'SET_CANDIDATE_TWIN'; payload: CandidateTwin }
  | { type: 'SET_TOAST'; payload: Toast }
  | { type: 'RESET_INTERVIEW' }
  | { type: 'RESET_ALL' }

const initialState: AppState = {
  candidate: null,
  interview: null,
  currentQuestion: null,
  currentAnswer: '',
  isRecording: false,
  isProcessing: false,
  showMicroFeedback: false,
  lastEvaluation: null,
  candidateTwin: null,
  toast: null,
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CANDIDATE':
      return { ...state, candidate: action.payload }
    case 'SET_INTERVIEW':
      return { ...state, interview: action.payload }
    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestion: action.payload }
    case 'SET_CURRENT_ANSWER':
      return { ...state, currentAnswer: action.payload }
    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload }
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }
    case 'SET_SHOW_MICRO_FEEDBACK':
      return { ...state, showMicroFeedback: action.payload }
    case 'SET_LAST_EVALUATION':
      return { ...state, lastEvaluation: action.payload }
    case 'ADD_ANSWER':
      return {
        ...state,
        interview: state.interview
          ? { ...state.interview, answers: [...state.interview.answers, action.payload] }
          : null,
      }
    case 'ADD_EVALUATION':
      return {
        ...state,
        interview: state.interview
          ? { ...state.interview, evaluations: [...state.interview.evaluations, action.payload] }
          : null,
      }
    case 'NEXT_QUESTION':
      return {
        ...state,
        interview: state.interview
          ? { ...state.interview, currentQuestionIndex: state.interview.currentQuestionIndex + 1 }
          : null,
        currentAnswer: '',
        showMicroFeedback: false,
        lastEvaluation: null,
      }
    case 'SET_CANDIDATE_TWIN':
      return { ...state, candidateTwin: action.payload }
    case 'SET_TOAST':
      return { ...state, toast: action.payload }
    case 'RESET_INTERVIEW':
      return {
        ...state,
        interview: null,
        currentQuestion: null,
        currentAnswer: '',
        isRecording: false,
        isProcessing: false,
        showMicroFeedback: false,
        lastEvaluation: null,
      }
    case 'RESET_ALL':
      return initialState
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
  showToast: (message: string, type: ToastType) => void
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const showToast = (message: string, type: ToastType = 'info') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type } })
    setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 4000)
  }

  return (
    <AppContext.Provider value={{ state, dispatch, showToast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export function useCandidate() {
  const { state, dispatch } = useApp()
  return {
    candidate: state.candidate,
    setCandidate: (candidate: Candidate) => dispatch({ type: 'SET_CANDIDATE', payload: candidate }),
  }
}

export function useInterview() {
  const { state, dispatch } = useApp()
  return {
    interview: state.interview,
    currentQuestion: state.currentQuestion,
    currentAnswer: state.currentAnswer,
    isRecording: state.isRecording,
    isProcessing: state.isProcessing,
    showMicroFeedback: state.showMicroFeedback,
    lastEvaluation: state.lastEvaluation,
    setInterview: (interview: Interview) => dispatch({ type: 'SET_INTERVIEW', payload: interview }),
    setCurrentQuestion: (question: Question) => dispatch({ type: 'SET_CURRENT_QUESTION', payload: question }),
    setCurrentAnswer: (answer: string) => dispatch({ type: 'SET_CURRENT_ANSWER', payload: answer }),
    setRecording: (recording: boolean) => dispatch({ type: 'SET_RECORDING', payload: recording }),
    setProcessing: (processing: boolean) => dispatch({ type: 'SET_PROCESSING', payload: processing }),
    setShowMicroFeedback: (show: boolean) => dispatch({ type: 'SET_SHOW_MICRO_FEEDBACK', payload: show }),
    setLastEvaluation: (evaluation: Evaluation | null) => dispatch({ type: 'SET_LAST_EVALUATION', payload: evaluation }),
    addAnswer: (answer: Answer) => dispatch({ type: 'ADD_ANSWER', payload: answer }),
    addEvaluation: (evaluation: Evaluation) => dispatch({ type: 'ADD_EVALUATION', payload: evaluation }),
    nextQuestion: () => dispatch({ type: 'NEXT_QUESTION' }),
    resetInterview: () => dispatch({ type: 'RESET_INTERVIEW' }),
  }
}

export function useCandidateTwin() {
  const { state, dispatch } = useApp()
  return {
    candidateTwin: state.candidateTwin,
    setCandidateTwin: (twin: CandidateTwin) => dispatch({ type: 'SET_CANDIDATE_TWIN', payload: twin }),
  }
}

export function useToast() {
  const { showToast } = useApp()
  return showToast
}