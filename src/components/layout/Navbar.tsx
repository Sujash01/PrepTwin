import { Link, useLocation } from 'react-router-dom'
import { Brain, User, BarChart2, MessageCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/helpers'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Brain },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/twin', label: 'Your Twin', icon: User },
  { path: '/results', label: 'Results', icon: BarChart2 },
] as const

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" aria-label="PrepTwin Home">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-100 hidden sm:block">PrepTwin</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link to="/setup">
              <Button variant="primary" size="sm">
                Start Interview
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-surface-700/50 animate-slide-down">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
              <div className="pt-2 border-t border-surface-700/50">
                <ThemeToggle className="w-full justify-start" />
              </div>
              <div className="pt-2 border-t border-surface-700/50">
                <Link to="/setup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Start Interview
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}