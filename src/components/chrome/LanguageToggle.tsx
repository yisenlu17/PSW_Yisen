'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LOCALES, LOCALE_COOKIE, type Locale } from '@/lib/locale'
import { swapLocale } from '@/lib/href'
import { NAV_LATERAL } from '@/components/transitions'

/** What each language calls itself — never "Chinese", never "英语". */
const LABEL: Record<Locale, string> = { en: 'English', zh: '中文' }

/** The button names what it opens, in the language you are already reading. */
const TRIGGER: Record<Locale, string> = { en: 'Language', zh: '语言' }

/**
 * The same button where there is no room for a word.
 *
 * A phone masthead has to hold a name, this, and the menu button inside about 280px,
 * and "Language" is the piece that can give: the caret already says it opens
 * something, and the code says which language you are in — which is the more useful
 * of the two facts anyway. The accessible name is on `aria-label` either way, so
 * nothing is lost to a screen reader by swapping the visible text.
 */
const TRIGGER_SHORT: Record<Locale, string> = { en: 'EN', zh: '中' }

/**
 * Remembers the choice for next time.
 *
 * Only the bare domain reads this — every other address says its own language — so
 * the cookie decides one thing: whether someone who typed the domain from memory
 * lands where they left off.
 */
function remember(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`
}

/**
 * Picks a language from a menu of both, rather than flipping to the other one.
 *
 * Each option links to this same page in the other language, which is a real address
 * now that the language is the first path segment — so it is a client navigation that
 * keeps you on the project you were reading, rather than the round trip through
 * `/api/lang` that used to reload the document. Only opening the menu needs
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
        <span className="lang-toggle-long">{TRIGGER[current]}</span>
        <span className="lang-toggle-short" aria-hidden>
          {TRIGGER_SHORT[current]}
        </span>
        <svg className="lang-caret" viewBox="0 0 12 8" fill="none" aria-hidden>
          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul className="lang-menu" role="menu">
          {LOCALES.map((locale) => (
            <li key={locale} role="none">
              <Link
                role="menuitem"
                className="lang-option"
                href={swapLocale(pathname, locale)}
                transitionTypes={NAV_LATERAL}
                aria-current={locale === current}
                onClick={() => {
                  remember(locale)
                  setOpen(false)
                }}
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
