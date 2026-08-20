'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LOCALES, type Locale } from '@/lib/locale'

/** What each language calls itself — never "Chinese", never "英语". */
const LABEL: Record<Locale, string> = { en: 'English', zh: '中文' }

/** The button is narrow, so it shows the short form of whichever language is on. */
const SHORT: Record<Locale, string> = { en: 'EN', zh: '中文' }

/**
 * Picks a language from a menu of both, rather than flipping to the other one.
 *
 * Each option is a plain link to a route handler rather than a fetch: the handler
 * sets the cookie and redirects, so the whole response — chrome included — comes back
 * in the chosen language, and it works before hydration. Only opening the menu needs
 * JavaScript; with none, the button is inert but the page is still readable.
 */
export function LanguageToggle({ current }: { current: Locale }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // Escape closes, and so does a click anywhere else — a menu that stays open while
  // you go and click something else reads as stuck.
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

  return (
    <div className="lang" ref={root}>
      <button
        type="button"
        className="lang-toggle"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={current === 'zh' ? '选择语言' : 'Choose language'}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {SHORT[current]}
        <svg className="lang-caret" viewBox="0 0 12 8" fill="none" aria-hidden>
          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul className="lang-menu" role="menu">
          {LOCALES.map((locale) => (
            <li key={locale} role="none">
              <a
                role="menuitem"
                className="lang-option"
                href={`/api/lang?to=${locale}&next=${encodeURIComponent(pathname)}`}
                aria-current={locale === current}
                onClick={() => setOpen(false)}
              >
                {LABEL[locale]}
                {locale === current && (
                  <svg className="lang-check" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                      d="M2 7.5 5.5 11 12 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
