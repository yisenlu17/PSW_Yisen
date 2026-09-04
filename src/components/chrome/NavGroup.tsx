'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { Locale } from '@/lib/locale'
import { NAV_FORWARD, NAV_LATERAL } from '@/components/transitions'

export type NavChild = { key: string; href: string; label: string; note?: string }

/** What the caret is for, said once per language. */
const OPEN_LABEL: Record<Locale, (section: string) => string> = {
  en: (section) => `${section} pages`,
  zh: (section) => `${section}子页面`,
}

/**
 * A nav item that is both a page and a menu of the pages under it.
 *
 * The label stays a plain link — Experience is a page in its own right, and burying
 * it behind a menu would cost a click to reach the list of everything. The caret
 * beside it is the menu, so a pointer can hover into it and a keyboard or a touch
 * can open it deliberately.
 *
 * Unlike `NavLink`, the header marks the whole section: while you are reading
 * `/experience/orfeostory` you are still somewhere under Experience, and the gold
 * underline should say so. That is `data-section` rather than `aria-current="page"`,
 * because a role's page is not the Experience page — only the page itself is.
 */
export function NavGroup({
  href,
  label,
  items,
  locale,
  className,
}: {
  href: string
  label: string
  items: NavChild[]
  locale: Locale
  className?: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const [openedAt, setOpenedAt] = useState(pathname)

  // Navigating closes the menu, browser back included. Adjusting during render
  // rather than in an effect avoids a frame where the panel hangs over the new page.
  if (openedAt !== pathname) {
    setOpenedAt(pathname)
    setOpen(false)
  }

  // Escape closes, and so does a click anywhere else — the same contract as the
  // language menu, because it is the same gesture in a second place.
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onPointerDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  const here = pathname === href
  const inSection = here || pathname.startsWith(`${href}/`)

  return (
    <div
      className="nav-group"
      data-section={inSection ? 'true' : undefined}
      ref={root}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      // Tabbing in opens the menu; tabbing out of it entirely closes it again, so a
      // keyboard reaches the subpages in the same order the eye does.
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <Link
        href={href}
        className={className}
        aria-current={here ? 'page' : undefined}
        transitionTypes={NAV_LATERAL}
      >
        {label}
      </Link>

      <button
        type="button"
        className="nav-caret"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={OPEN_LABEL[locale](label)}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <svg viewBox="0 0 12 8" fill="none" aria-hidden>
          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul className="nav-menu" role="menu">
          {items.map((item) => (
            <li key={item.key} role="none">
              <Link
                role="menuitem"
                className="nav-option"
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                transitionTypes={NAV_FORWARD}
                onClick={() => setOpen(false)}
              >
                <span className="nav-option-label">{item.label}</span>
                {item.note && <span className="nav-option-note">{item.note}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
