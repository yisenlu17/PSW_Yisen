'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Tells the masthead when it has left the hero behind.
 *
 * The header sits over a full-screen navy hero on the homepage, and a white bar
 * across the top of that is the single most template-looking thing the site had.
 * So over a hero it is transparent with white type, and once the hero has scrolled
 * away it becomes the white bar it needs to be over white content.
 *
 * The *transparent* half of that is pure CSS — `.masthead:has(~ main .hero)` in
 * ui-kit.css — which is what makes it correct on the server, per page, with no
 * flash of the wrong state on load. All this adds is the moment it changes, which
 * CSS cannot see: one attribute, flipped by one observer, no scroll listener.
 *
 * A page with no hero never gets the transparent state in the first place, so
 * there is nothing here to run and the effect leaves immediately.
 */
export function MastheadState() {
  const pathname = usePathname()

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.masthead')
    const hero = document.querySelector<HTMLElement>('main .hero')
    if (!header || !hero) return

    // The switch should happen when the hero's bottom edge passes under the
    // header's own bottom edge, not when it leaves the viewport — otherwise the
    // bar is still transparent while sitting over the section below.
    const head = header.getBoundingClientRect().height

    const observer = new IntersectionObserver(
      ([entry]) => {
        header.toggleAttribute('data-scrolled', !entry.isIntersecting)
      },
      { rootMargin: `-${Math.round(head)}px 0px 0px 0px`, threshold: 0 }
    )

    observer.observe(hero)
    return () => {
      observer.disconnect()
      header.removeAttribute('data-scrolled')
    }
  }, [pathname])

  return null
}
