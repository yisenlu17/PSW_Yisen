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
import { getLocale } from '@/lib/locale-server'
import type { SiteSettings } from '@/lib/site'

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
 * Chrome lives here so every page — home and subpages alike — gets the same header
 * and footer from the same two documents, rather than each page re-fetching them.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ isEnabled: isDraft }, locale, { data: settings }, { data: nav }, { data: subpages }] =
    await Promise.all([
      draftMode(),
      getLocale(),
      sanityFetch({ query: GLOBAL_SETTINGS_QUERY }),
      sanityFetch({ query: NAVIGATION_QUERY }),
      sanityFetch({ query: NAV_CHILDREN_QUERY }),
    ])

  const site = (settings ?? null) as SiteSettings | null

  return (
    <>
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
    </>
  )
}
