'use client'

import { useEffect, useState } from 'react'

/**
 * The gold word at the end of the hero headline.
 *
 * Renders the first word on the server so the headline is complete before hydration
 * and never flashes empty. Cycling stops entirely when the visitor has asked for
 * reduced motion, or when the editor turned it off, or when there is only one word —
 * in each of those cases the first word simply stays.
 */
export function RotatingWord({ words, enabled }: { words: string[]; enabled: boolean }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const active = enabled && words.length > 1

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let fadeTimer: ReturnType<typeof setTimeout>
    const cycle = setInterval(() => {
      setVisible(false)
      fadeTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length)
        setVisible(true)
      }, 350)
    }, 2600)

    return () => {
      clearInterval(cycle)
      clearTimeout(fadeTimer)
    }
  }, [active, words.length])

  return (
    <span className="rotor">
      <span
        className="rword"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-8px)',
        }}
      >
        {words[index] ?? ''}
      </span>
    </span>
  )
}
