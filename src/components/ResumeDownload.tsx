'use client'

import { useEffect, useRef, useState } from 'react'

import type { Locale } from '@/lib/locale'
import type { ResumeLink } from '@/lib/site'

/** Each file is named in the language it is written in — the rule the language menu follows too. */
const FILE_LABEL: Record<Locale, string> = { en: 'English', zh: '中文' }

const COPY: Record<Locale, { both: string; one: string; pair: string; menu: string }> = {
  en: { both: 'Both files', one: 'PDF', pair: 'PDF ×2', menu: 'Choose a résumé' },
  zh: { both: '两份都下载', one: 'PDF', pair: 'PDF ×2', menu: '选择简历' },
}

/**
 * A résumé button that asks which language, instead of guessing.
 *
 * Only rendered when both PDFs exist — with one file there is nothing to choose, and
 * the CTA falls back to a plain link. The two languages are ordinary `<a download>`
 * links so they can be middle-clicked, copied or saved like any other; only "both"
 * needs a handler, because no markup hands over two files at once.
 *
 * Opening the menu needs JavaScript. That is the same bargain the language menu
 * makes, and the footer still lists both PDFs as plain links for anyone without it.
 */
export function ResumeDownload({
  label,
  className,
  files,
  locale,
}: {
  label: string
  className: string
  files: { en: ResumeLink; zh: ResumeLink }
  locale: Locale
}) {
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

  // The language being read comes first: someone reading 中文 is most likely after the
  // Chinese CV, and the list should not make them read past the other one to find it.
  const order: Locale[] = locale === 'zh' ? ['zh', 'en'] : ['en', 'zh']
  const copy = COPY[locale]

  // Two files means two downloads — the browser offers no way to hand over a pair.
  // Firing them a beat apart is what keeps the second one: back to back, browsers
  // read the second as an unasked-for pop-up and drop it silently.
  const downloadBoth = () => {
    setOpen(false)
    order.forEach((lang, i) => {
      window.setTimeout(() => {
        const link = document.createElement('a')
        link.href = files[lang].url
        // Ignored for a cross-origin URL, where the CDN's `?dl=` header does the real
        // work; kept for the browsers that honour it, since it costs nothing.
        link.download = files[lang].filename
        link.rel = 'noopener'
        document.body.append(link)
        link.click()
        link.remove()
      }, i * 600)
    })
  }

  return (
    <div className="resume-pick" ref={root}>
      <button
        type="button"
        className={`${className} resume-toggle`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {label}
        <svg className="resume-caret" viewBox="0 0 12 8" fill="none" aria-hidden>
          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul className="resume-menu" role="menu" aria-label={copy.menu}>
          {order.map((lang) => (
            <li key={lang} role="none">
              <a
                role="menuitem"
                className="resume-option"
                href={files[lang].url}
                download=""
                onClick={() => setOpen(false)}
              >
                {FILE_LABEL[lang]}
                <span className="resume-note">{copy.one}</span>
              </a>
            </li>
          ))}
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="resume-option resume-option-both"
              onClick={downloadBoth}
            >
              {copy.both}
              <span className="resume-note">{copy.pair}</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
