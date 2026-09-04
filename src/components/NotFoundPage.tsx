import Link from 'next/link'

import { homeHref } from '@/lib/href'
import type { Locale } from '@/lib/locale'
import { NAV_LATERAL } from '@/components/transitions'

const COPY: Record<Locale, { title: string; body: string; back: string }> = {
  en: {
    title: 'That page is not here.',
    body: 'The address may have changed, or it may never have existed. Everything on the site is one click away in the menu above.',
    back: 'Back to the homepage',
  },
  zh: {
    title: '这个页面不在这里。',
    body: '地址可能变了，也可能从来没有过。站里的所有内容，上面的菜单点一下都能到。',
    back: '回到首页',
  },
}

/**
 * A link that no longer leads anywhere, answered in the site's own voice.
 *
 * Rendered by the route rather than thrown to a `not-found` boundary, and the reason
 * is worth writing down because two other approaches were tried first. A nested
 * `not-found.tsx` cannot compose a page here — Next builds one from a single root
 * layout, and this app has two, the site's sitting on a dynamic `[locale]` segment.
 * `app/global-not-found.tsx` is the documented answer to exactly that, but its
 * override is wired into the webpack app loader, and this project builds with
 * Turbopack, which always resolves the built-in. Both failed silently, rendering the
 * default page with no error to explain it.
 *
 * Returning it from the route works everywhere, and is better in one respect: it
 * renders inside the layout, so a visitor who followed a dead link still has the
 * header, the menu and the language switch rather than a page with one way out.
 *
 * The response stays 200. `loading.tsx` starts the stream before the route knows
 * whether the document exists, and a status cannot be changed once headers are sent
 * — which is true of `notFound()` here too. What matters for indexing is the
 * `noindex` in the metadata, which is the same protection Next's own streamed 404
 * relies on.
 */
export function NotFoundPage({ locale }: { locale: Locale }) {
  const copy = COPY[locale]

  return (
    <main className="detail">
      <header className="detail-head">
        <div className="wrap">
          <p className="eyebrow">404</p>
          <h1>{copy.title}</h1>
          <p className="detail-lede">{copy.body}</p>
          <div className="detail-links">
            <Link href={homeHref(locale)} className="btn btn-gold" transitionTypes={NAV_LATERAL}>
              {copy.back}
            </Link>
          </div>
        </div>
      </header>
    </main>
  )
}

/** The one thing a missing page must tell a crawler. */
export const NOT_FOUND_METADATA = {
  title: '404',
  robots: { index: false, follow: true },
} as const
