'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * The same elements the scroll-driven rules in site.css pick up. Kept in step with
 * the group selector under "scroll reveal" there — these are two spellings of one
 * decision, and only one of them ever runs.
 */
const TARGETS = [
  ".section:not([data-animation='none']) .wrap > * > *",
  '.detail-metrics > *',
  '.detail-related-grid > *',
].join(', ')

/**
 * The reveal, for browsers without scroll-driven animations.
 *
 * Firefox has not shipped `animation-timeline` outside Nightly, so this puts the
 * same movement back with an IntersectionObserver — the observer the prototype's
 * `.reveal` / `.reveal.in` rules were written for and that never made it across.
 *
 * It does nothing at all where the CSS works, which is the point: two systems
 * animating the same element would fight over its transform, and the check is what
 * keeps them from ever both being on.
 */
export function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    // The real thing is available and already running. Leave.
    if (typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('in')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 }
    )

    for (const el of document.querySelectorAll<HTMLElement>(TARGETS)) {
      // Anything already on screen is left exactly as it rendered. Hiding it now,
      // one frame after the browser painted it, would be a flicker rather than an
      // entrance — the animation is for things you have not seen yet.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) continue

      el.classList.add('reveal')
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [pathname])

  return null
}
