import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { ToastContainer } from '../components/ui/Toast'
import { useApp } from '../hooks/useApp'

export function MainLayout() {
  const { state } = useApp()
  const { pathname } = useLocation()
  const isLanding = pathname === '/'

  return (
    <div className="min-h-screen bg-surface-950">
      {!isLanding && <Navbar />}
      <main className={isLanding ? 'min-h-screen' : 'pt-16 min-h-[calc(100vh-4rem)]'}>
        <Outlet />
      </main>
      <ToastContainer toasts={state.toast ? [{ id: '1', message: state.toast.message, type: state.toast.type }] : []} onClose={() => {}} />
    </div>
  )
}

export function InterviewLayout() {
  return (
    <div className="min-h-screen bg-surface-950">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}