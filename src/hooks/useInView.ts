import { useEffect, useRef, useState } from 'react'

export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}