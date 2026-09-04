import { sanityFetch } from '@/sanity/fetch'
import { GLOBAL_SETTINGS_QUERY } from '@/sanity/queries'
import { DEFAULT_LOCALE, LOCALES, localeParam, t } from '@/lib/locale'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'
import type { SiteSettings } from '@/lib/site'

export const alt = 'Yisen Lu'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/**
 * The card behind every page that does not bring its own. Two languages, two images,
 * both built at deploy time rather than on the first crawler to ask.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeParam((await params).locale) ?? DEFAULT_LOCALE
  const { data } = await sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false })
  const site = (data ?? null) as SiteSettings | null

  const name = site?.name || 'Yisen Lu'
  const localName = site?.nameLocal || name
  const place = t(site?.currentLocation, locale) || ''

  return ogImage(
    {
      eyebrow: t(site?.currentRole, locale) || undefined,
      title: locale === 'zh' ? localName : name,
      footer: place,
    },
    {
      eyebrow: t(site?.currentRole, DEFAULT_LOCALE) || undefined,
      title: name,
      footer: t(site?.currentLocation, DEFAULT_LOCALE) || '',
    }
  )
}
