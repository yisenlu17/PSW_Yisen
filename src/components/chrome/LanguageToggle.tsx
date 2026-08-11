'use client'

import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/locale'

/**
 * Switches language and returns to the same page.
 *
 * A plain link to a route handler rather than a fetch: the handler sets the cookie
 * and redirects, so the whole response — chrome included — comes back in the new
 * language, and it works before hydration.
 */
export function LanguageToggle({ current }: { current: Locale }) {
  const pathname = usePathname()
  const next: Locale = current === 'en' ? 'zh' : 'en'

  return (
    <a
      className="lang-toggle"
      href={`/api/lang?to=${next}&next=${encodeURIComponent(pathname)}`}
      aria-label={next === 'zh' ? '切换到中文' : 'Switch to English'}
    >
      {next === 'zh' ? '中文' : 'EN'}
    </a>
  )
}
