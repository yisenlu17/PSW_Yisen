'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Counts up once, when the number first scrolls into view.
 *
 * The final value renders on the server, so the correct number is present without
 * JavaScript and for anyone who prefers reduced motion — the animation only ever
 * replaces a number that is already right.
 */
export function CountUp({ to, display }: { to: number; display: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        const duration = 1100
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1)
          // Ease-out so it decelerates into the final number instead of stopping dead.
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))))
          if (p < 1) frame = requestAnimationFrame(tick)
          else setValue(null)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [to])

  return <span ref={ref}>{value === null ? display : value.toLocaleString('en-US')}</span>
}
