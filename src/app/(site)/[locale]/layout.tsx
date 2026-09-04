import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { urlFor } from '@/sanity/image'

import { DisableDraftMode } from '@/components/DisableDraftMode'
import { Header } from '@/components/chrome/Header'
import { Footer } from '@/components/chrome/Footer'
import { SanityLive } from '@/sanity/live'
import { sanityFetch } from '@/sanity/fetch'
import { GLOBAL_SETTINGS_QUERY, NAV_CHILDREN_QUERY, NAVIGATION_QUERY } from '@/sanity/queries'
import { DEFAULT_LOCALE, htmlLang, localeParam } from '@/lib/locale'
import type { SiteSettings } from '@/lib/site'

import '@/styles/fonts.css'
import '@/styles/tokens.css'
import '@/styles/ui-kit.css'
import '@/styles/site.css'

/**
 * The favicon is authored in the CMS, so it is resolved here rather than shipped as
 * a file. Next merges this with each page's own metadata, and putting it on the site
 * layout keeps /studio — which brings its own — out of it.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false })
  const favicon = (data as SiteSettings | null)?.favicon

  if (!favicon) return {}

  return {
    icons: {
      icon: [
        { url: urlFor(favicon).width(32).height(32).format('png').url(), sizes: '32x32' },
        { url: urlFor(favicon).width(192).height(192).format('png').url(), sizes: '192x192' },
      ],
      apple: urlFor(favicon).width(180).height(180).format('png').url(),
    },
  }
}

/**
 * The site's root layout — `<html>` and all.
 *
 * It lives under `[locale]` rather than at `app/` because that is the only place
 * that knows the language: a layout is handed the params of its own segment, and the
 * language is this segment. Anywhere higher, `<html lang>` would have to be a guess,
 * which is what it used to be — hard-coded `en` while the body rendered Chinese.
 *
 * `/studio` keeps a root layout of its own for the same reason it always had its own
 * chrome, so the two never share a `<body>`.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // `proxy.ts` sends anything that is not a language to `/en/…` before it reaches a
  // route, so the fallback is unreachable. It is here so that a layout — which has no
  // `not-found` boundary above it to catch a throw — cannot be the thing that breaks.
  const { locale: param } = await params
  const locale = localeParam(param) ?? DEFAULT_LOCALE

  const [{ isEnabled: isDraft }, { data: settings }, { data: nav }, { data: subpages }] =
    await Promise.all([
      draftMode(),
      sanityFetch({ query: GLOBAL_SETTINGS_QUERY }),
      sanityFetch({ query: NAVIGATION_QUERY }),
      sanityFetch({ query: NAV_CHILDREN_QUERY }),
    ])

  const site = (settings ?? null) as SiteSettings | null

  return (
    <html lang={htmlLang(locale)}>
      <body>
        <Header nav={nav} subpages={subpages} site={site} locale={locale} />
        {children}
        <Footer nav={nav} site={site} locale={locale} />

        {/* Only for the editor. `<SanityLive />` holds an EventSource open to Sanity
            for the lifetime of the tab and posts a server action every time content
            moves; that is worth it inside Presentation, where the point is watching an
            edit land. A visitor reading published content gets nothing from it — the
            reads behind this page are cached and expired by `/api/revalidate` — beyond
            a connection to keep alive and a reason for the page to re-render. */}
        {isDraft && (
          <>
            <SanityLive />
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  )
}
