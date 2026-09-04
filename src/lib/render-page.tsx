import type { Metadata } from 'next'
import { stegaClean } from 'next-sanity'

import { sanityFetch } from '@/sanity/fetch'
import { PAGE_QUERY, GLOBAL_SETTINGS_QUERY } from '@/sanity/queries'
import { SectionRenderer, type SectionData } from '@/components/sections'
import { t, type Locale } from '@/lib/locale'
import { localeAlternates } from '@/lib/site-url'
import { NotFoundPage, NOT_FOUND_METADATA } from '@/components/NotFoundPage'
import type { SiteSettings } from '@/lib/site'

/**
 * Home and every subpage render identically — they differ only by slug — so the
 * two routes share this instead of keeping two copies that drift apart.
 *
 * The language arrives as an argument rather than being read here. It used to come
 * from a cookie, which any server module could reach; now it is the first segment of
 * the URL, which only the route knows.
 */
export async function renderPage(slug: string, locale: Locale) {
  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({ query: PAGE_QUERY, params: { slug } }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY }),
  ])

  if (!page) return <NotFoundPage locale={locale} />

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

export async function pageMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({ query: PAGE_QUERY, params: { slug }, stega: false }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false }),
  ])

  // A slug with nothing behind it is answered by the route rather than thrown, so
  // the metadata has to say so too — this is the `noindex` that keeps a dead link
  // out of the index.
  if (!page) return NOT_FOUND_METADATA

  const title =
    t(page.seoTitle, locale) || t(settings?.seoTitle, locale) || settings?.name || 'Yisen Lu'
  const description = t(page.seoDescription, locale) || t(settings?.seoDescription, locale)

  return {
    title,
    description: description || undefined,
    alternates: localeAlternates(locale, slug === '/' ? '' : `/${slug}`),
    openGraph: { title, description: description || undefined },
  }
}
