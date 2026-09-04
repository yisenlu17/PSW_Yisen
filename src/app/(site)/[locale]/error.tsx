'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/locale'

const COPY: Record<Locale, { title: string; body: string; retry: string }> = {
  en: {
    title: 'Something went wrong at our end.',
    body: 'This is not something you did. Trying again usually works.',
    retry: 'Try again',
  },
  zh: {
    title: '我们这边出了点问题。',
    body: '不是你操作的问题。重试一次通常就好了。',
    retry: '重试',
  },
}

/**
 * The same shell as the 404, for the rarer case where the page did exist and still
 * failed. `reset` re-renders the segment rather than reloading the document, so a
 * transient failure costs a click instead of the whole page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname()
  const first = pathname.split('/').filter(Boolean)[0]
  const locale = isLocale(first) ? first : DEFAULT_LOCALE
  const copy = COPY[locale]

  // The digest is the only thread back to the real stack, which stays on the server.
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="detail">
      <header className="detail-head">
        <div className="wrap">
          <p className="eyebrow">{error.digest ?? 'Error'}</p>
          <h1>{copy.title}</h1>
          <p className="detail-lede">{copy.body}</p>
          <div className="detail-links">
            <button type="button" className="btn btn-gold" onClick={reset}>
              {copy.retry}
            </button>
          </div>
        </div>
      </header>
    </main>
  )
}
