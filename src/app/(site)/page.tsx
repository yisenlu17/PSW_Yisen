import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { stegaClean } from 'next-sanity'

import { sanityFetch } from '@/sanity/live'
import { PAGE_QUERY, GLOBAL_SETTINGS_QUERY } from '@/sanity/queries'
import { SectionRenderer, type SectionData } from '@/components/sections'
import { LanguageToggle } from '@/components/LanguageToggle'
import { t, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/locale'
import type { SiteSettings } from '@/lib/site'

type SearchParams = Promise<{ lang?: string }>

async function resolveLocale(searchParams: SearchParams): Promise<Locale> {
  const { lang } = await searchParams
  return isLocale(lang) ? lang : DEFAULT_LOCALE
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const locale = await resolveLocale(searchParams)
  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({ query: PAGE_QUERY, params: { slug: '/' }, stega: false }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false }),
  ])

  const title = t(page?.seoTitle, locale) || t(settings?.seoTitle, locale) || settings?.name || 'Yisen Lu'
  const description = t(page?.seoDescription, locale) || t(settings?.seoDescription, locale)

  return {
    title,
    description: description || undefined,
    openGraph: { title, description: description || undefined },
  }
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const locale = await resolveLocale(searchParams)
  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({ query: PAGE_QUERY, params: { slug: '/' } }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY }),
  ])

  if (!page) notFound()

  return (
    <>
      <LanguageToggle current={locale} />
      <SectionRenderer
        sections={(page.sections ?? []) as SectionData[]}
        documentId={stegaClean(page._id)}
        documentType={stegaClean(page._type)}
        locale={locale}
        site={(settings ?? null) as SiteSettings | null}
      />
    </>
  )
}
