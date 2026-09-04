import { client } from '@/sanity/client'
import { sanityFetch } from '@/sanity/fetch'
import { GLOBAL_SETTINGS_QUERY, PAGE_QUERY, PAGE_SLUGS_QUERY } from '@/sanity/queries'
import { DEFAULT_LOCALE, LOCALES, localeParam, t } from '@/lib/locale'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'
import type { SiteSettings } from '@/lib/site'

export const alt = 'Yisen Lu'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export async function generateStaticParams() {
  const slugs = await client.fetch(PAGE_SLUGS_QUERY)
  const pages = (slugs ?? []).filter((s): s is string => Boolean(s) && s !== '/')
  return LOCALES.flatMap((locale) => pages.map((slug) => ({ locale, slug })))
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: param, slug } = await params
  const locale = localeParam(param) ?? DEFAULT_LOCALE

  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({ query: PAGE_QUERY, params: { slug }, stega: false }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false }),
  ])

  const site = (settings ?? null) as SiteSettings | null
  const name = site?.name || 'Yisen Lu'

  // `title` is the editor's own name for the page and is always set; `seoTitle` is
  // the optional override, and is what the page itself is titled with.
  const heading = t(page?.seoTitle, locale) || page?.title || name

  return ogImage(
    { eyebrow: name, title: heading, footer: t(site?.currentLocation, locale) || '' },
    {
      eyebrow: name,
      title: t(page?.seoTitle, DEFAULT_LOCALE) || page?.title || name,
      footer: t(site?.currentLocation, DEFAULT_LOCALE) || '',
    }
  )
}
