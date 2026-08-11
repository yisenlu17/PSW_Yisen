import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { stegaClean } from 'next-sanity'

import { sanityFetch } from '@/sanity/live'
import { PAGE_QUERY, GLOBAL_SETTINGS_QUERY } from '@/sanity/queries'
import { SectionRenderer, type SectionData } from '@/components/sections'
import { getLocale } from '@/lib/locale-server'
import { t } from '@/lib/locale'
import type { SiteSettings } from '@/lib/site'

/**
 * Home and every subpage render identically — they differ only by slug — so the
 * two routes share this instead of keeping two copies that drift apart.
 */
export async function renderPage(slug: string) {
  const [locale, { data: page }, { data: settings }] = await Promise.all([
    getLocale(),
    sanityFetch({ query: PAGE_QUERY, params: { slug } }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY }),
  ])

  if (!page) notFound()

  return (
    <SectionRenderer
      sections={(page.sections ?? []) as SectionData[]}
      documentId={stegaClean(page._id)}
      documentType={stegaClean(page._type)}
      locale={locale}
      site={(settings ?? null) as SiteSettings | null}
    />
  )
}

export async function pageMetadata(slug: string): Promise<Metadata> {
  const [locale, { data: page }, { data: settings }] = await Promise.all([
    getLocale(),
    sanityFetch({ query: PAGE_QUERY, params: { slug }, stega: false }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false }),
  ])

  const title =
    t(page?.seoTitle, locale) || t(settings?.seoTitle, locale) || settings?.name || 'Yisen Lu'
  const description = t(page?.seoDescription, locale) || t(settings?.seoDescription, locale)

  return {
    title,
    description: description || undefined,
    openGraph: { title, description: description || undefined },
  }
}
