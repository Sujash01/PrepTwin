import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Candidate Twin', href: '#candidate-twin' },
]

export function LandingNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-950/70 backdrop-blur-xl border-b border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5" aria-label="PrepTwin Home">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-100">PrepTwin</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm font-medium text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/chat"
              className="px-4 py-2 rounded-xl text-sm font-medium text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 transition-all duration-200"
            >
              Chat
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Link to="/setup">
              <Button size="sm">
                Start Interview
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 -mr-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            onClick={() => setOpen(prev => !prev)}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="landing-mobile-menu"
          className="md:hidden border-t border-surface-700/50 bg-surface-950/95 backdrop-blur-xl animate-slide-down"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-medium text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/chat"
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-medium text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 transition-all duration-200"
            >
              Chat
            </Link>
            <div className="mt-2 pt-4 border-t border-surface-700/50 flex flex-col gap-2">
              <ThemeToggle className="justify-start" />
              <Button variant="ghost" className="w-full">
                Sign In
              </Button>
              <Link to="/setup" onClick={() => setOpen(false)}>
                <Button className="w-full">
                  Start Interview
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}