'use client'

import { useEffect } from 'react'

/**
 * The primary buttons drift toward the cursor, then spring back.
 *
 * Only the pull is scripted, and only as two CSS variables — the release is the
 * transition in motion.css, so letting go costs no frames of JavaScript. One
 * delegated `pointermove` on the document covers every `.magnetic` on the page,
 * including ones that arrive with a navigation, so nothing has to be re-bound.
 *
 * Skipped entirely on coarse pointers, where there is no hover to answer, and under
 * reduced motion. Both are checked once, here, rather than trusted to the blanket
 * rule in motion.css: that rule shortens durations and cannot reach a transform this
 * sets directly.
 */
export function Magnetic() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Far enough that the button leans toward you before the pointer is on it,
    // near enough that it never chases a cursor crossing the page.
    const RADIUS = 88
    const STRENGTH = 0.28

    const release = (el: HTMLElement) => {
      el.style.removeProperty('--mx')
      el.style.removeProperty('--my')
    }

    const onMove = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('.magnetic')
      if (!target) return

      const box = target.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)

      if (Math.hypot(dx, dy) > RADIUS) return release(target)

      target.style.setProperty('--mx', `${dx * STRENGTH}px`)
      target.style.setProperty('--my', `${dy * STRENGTH}px`)
    }

    const onOut = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('.magnetic')
      if (target) release(target)
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
      for (const el of document.querySelectorAll<HTMLElement>('.magnetic')) release(el)
    }
  }, [])

  return null
}
