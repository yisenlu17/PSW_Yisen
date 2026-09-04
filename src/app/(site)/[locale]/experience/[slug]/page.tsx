import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { client } from '@/sanity/client'
import { sanityFetch } from '@/sanity/fetch'
import { EXPERIENCE_QUERY, EXPERIENCE_SLUGS_QUERY, GLOBAL_SETTINGS_QUERY } from '@/sanity/queries'
import { ExperienceDetail, type ExperienceDetailData } from '@/components/detail/ExperienceDetail'
import { LOCALES, localeParam, t } from '@/lib/locale'
import { localeAlternates } from '@/lib/site-url'
import { PageTransition } from '@/components/transitions'

/**
 * `/<locale>/experience/<slug>`. The studio's Presentation config has pointed at this
 * URL since the Experience document type was written; this is the page it was
 * pointing at.
 */
export async function generateStaticParams() {
  const slugs = await client.fetch(EXPERIENCE_SLUGS_QUERY)
  const roles = (slugs ?? []).filter((s): s is string => Boolean(s))
  return LOCALES.flatMap((locale) => roles.map((slug) => ({ locale, slug })))
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: param, slug } = await params
  const locale = localeParam(param)
  if (!locale) return {}

  const [{ data: role }, { data: settings }] = await Promise.all([
    sanityFetch({ query: EXPERIENCE_QUERY, params: { slug }, stega: false }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false }),
  ])

  if (!role) return {}

  const name = settings?.name || 'Yisen Lu'
  const title = [t(role.role, locale), role.company].filter(Boolean).join(' — ') || name
  const description = t(role.summary, locale)

  return {
    title: `${title} — ${name}`,
    description: description || undefined,
    alternates: localeAlternates(locale, `/experience/${slug}`),
    openGraph: { title, description: description || undefined, type: 'article' },
  }
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: param, slug } = await params
  const locale = localeParam(param)
  if (!locale) notFound()

  const { data: role } = await sanityFetch({ query: EXPERIENCE_QUERY, params: { slug } })
  if (!role) notFound()

  return (
    <PageTransition>
      <ExperienceDetail experience={role as unknown as ExperienceDetailData} locale={locale} />
    </PageTransition>
  )
}
