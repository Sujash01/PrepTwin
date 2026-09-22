import type { ReactNode } from 'react'
import { cn } from '../../utils/helpers'
import { useInView } from '../../hooks/useInView'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}