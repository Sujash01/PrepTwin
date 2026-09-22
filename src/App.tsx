import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './hooks/useApp'
import { MainLayout, InterviewLayout } from './layouts/MainLayout'
import { Toast } from './components/ui/Toast'
import { Brain } from 'lucide-react'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const CandidateSetupPage = lazy(() => import('./pages/CandidateSetupPage'))
const InterviewRoomPage = lazy(() => import('./pages/InterviewRoomPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const CandidateTwinPage = lazy(() => import('./pages/CandidateTwinPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-950">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center border border-primary-500/30 animate-pulse-slow">
          <Brain className="w-8 h-8 text-primary-400" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="text-sm text-surface-500">Loading PrepTwin...</p>
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()
  const { state } = useApp()

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/setup" element={<CandidateSetupPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/twin" element={<CandidateTwinPage />} />
          </Route>
          <Route path="/interview" element={<InterviewLayout />}>
            <Route index element={<InterviewRoomPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {state.toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          <div className="pointer-events-auto">
            <Toast
              message={state.toast.message}
              type={state.toast.type}
              onClose={() => undefined}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}