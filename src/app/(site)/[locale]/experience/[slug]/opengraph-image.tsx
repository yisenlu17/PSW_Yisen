import { client } from '@/sanity/client'
import { sanityFetch } from '@/sanity/fetch'
import { EXPERIENCE_QUERY, EXPERIENCE_SLUGS_QUERY, GLOBAL_SETTINGS_QUERY } from '@/sanity/queries'
import { DEFAULT_LOCALE, LOCALES, localeParam, t } from '@/lib/locale'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'
import { roleCompany } from '@/lib/experience'
import type { SiteSettings } from '@/lib/site'

export const alt = 'Experience'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export async function generateStaticParams() {
  const slugs = await client.fetch(EXPERIENCE_SLUGS_QUERY)
  const roles = (slugs ?? []).filter((s): s is string => Boolean(s))
  return LOCALES.flatMap((locale) => roles.map((slug) => ({ locale, slug })))
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: param, slug } = await params
  const locale = localeParam(param) ?? DEFAULT_LOCALE

  const [{ data: role }, { data: settings }] = await Promise.all([
    sanityFetch({ query: EXPERIENCE_QUERY, params: { slug }, stega: false }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false }),
  ])

  const site = (settings ?? null) as SiteSettings | null
  const name = site?.name || 'Yisen Lu'

  return ogImage(
    {
      eyebrow: role ? roleCompany(role, locale) : undefined,
      title: (role ? t(role.role, locale) : '') || name,
      footer: name,
    },
    {
      eyebrow: role?.company || undefined,
      title: (role ? t(role.role, DEFAULT_LOCALE) : '') || name,
      footer: name,
    }
  )
}
