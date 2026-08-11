import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'

import { DisableDraftMode } from '@/components/DisableDraftMode'
import { Header } from '@/components/chrome/Header'
import { Footer } from '@/components/chrome/Footer'
import { SanityLive } from '@/sanity/live'
import { sanityFetch } from '@/sanity/live'
import { GLOBAL_SETTINGS_QUERY, NAVIGATION_QUERY } from '@/sanity/queries'
import { getLocale } from '@/lib/locale-server'
import type { SiteSettings } from '@/lib/site'

import '@/styles/tokens.css'
import '@/styles/ui-kit.css'
import '@/styles/site.css'

/**
 * Chrome lives here so every page — home and subpages alike — gets the same header
 * and footer from the same two documents, rather than each page re-fetching them.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ isEnabled: isDraft }, locale, { data: settings }, { data: nav }] = await Promise.all([
    draftMode(),
    getLocale(),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY }),
    sanityFetch({ query: NAVIGATION_QUERY }),
  ])

  const site = (settings ?? null) as SiteSettings | null

  return (
    <>
      <Header nav={nav} site={site} locale={locale} />
      {children}
      <Footer nav={nav} site={site} locale={locale} />

      <SanityLive />
      {isDraft && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </>
  )
}
