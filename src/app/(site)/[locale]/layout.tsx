import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { urlFor } from '@/sanity/image'

import { DraftTools } from '@/sanity/draft-tools'
import { Header } from '@/components/chrome/Header'
import { Footer } from '@/components/chrome/Footer'
import { MastheadState } from '@/components/chrome/MastheadState'
import { ScrollReveal } from '@/components/ScrollReveal'
import { Magnetic } from '@/components/Magnetic'
import { PersonSchema } from '@/components/PersonSchema'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { sanityFetch } from '@/sanity/fetch'
import { GLOBAL_SETTINGS_QUERY, NAV_CHILDREN_QUERY, NAVIGATION_QUERY } from '@/sanity/queries'
import { DEFAULT_LOCALE, htmlLang, localeParam } from '@/lib/locale'
import { IS_STATIC_EXPORT } from '@/lib/static-export'
import { metadataBase } from '@/lib/site-url'
import type { SiteSettings } from '@/lib/site'

import '@/styles/fonts.css'
import '@/styles/tokens.css'
import '@/styles/ui-kit.css'
import '@/styles/site.css'
import '@/styles/motion.css'

/**
 * The favicon is authored in the CMS, so it is resolved here rather than shipped as
 * a file. Next merges this with each page's own metadata, and putting it on the site
 * layout keeps /studio — which brings its own — out of it.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false })
  const favicon = (data as SiteSettings | null)?.favicon

  // Without a base, every relative URL in a page's metadata — the share card above
  // all — is emitted as a path, and a crawler reading it from somewhere else on the
  // internet has nothing to resolve it against.
  const base = { metadataBase: metadataBase() }

  if (!favicon) return base

  return {
    ...base,
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

  const [isDraft, { data: settings }, { data: nav }, { data: subpages }] = await Promise.all([
    // See `sanity/fetch.ts`: in the static build there is no request to read the
    // cookie off, and Next treats the call itself as the error rather than returning
    // a false. Nothing downstream of it can be true there anyway.
    IS_STATIC_EXPORT ? false : draftMode().then(({ isEnabled }) => isEnabled),
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
        <MastheadState />
        <ScrollReveal />
        <Magnetic />
        <PersonSchema site={site} locale={locale} />

        {/* Which project a recruiter opened, and how the page performed while they
            were on it. Both are cookieless and neither reads anything identifying.

            Left out of the static build, and not only because it reports to a project
            it is no longer part of: both scripts load from Vercel's own domains, which
            are the thing that copy of the site exists to route around. On the reader
            it was built for they are two requests per page that hang until they give
            up. */}
        {!IS_STATIC_EXPORT && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}

        {/* Only for the editor. `<SanityLive />` holds an EventSource open to Sanity
            for the lifetime of the tab and posts a server action every time content
            moves; that is worth it inside Presentation, where the point is watching an
            edit land. A visitor reading published content gets nothing from it — the
            reads behind this page are cached and expired by `/api/revalidate` — beyond
            a connection to keep alive and a reason for the page to re-render. */}
        {isDraft && <DraftTools />}
      </body>
    </html>
  )
}
