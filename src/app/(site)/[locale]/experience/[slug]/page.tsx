import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { client } from '@/sanity/client'
import { sanityFetch } from '@/sanity/fetch'
import { EXPERIENCE_QUERY, EXPERIENCE_SLUGS_QUERY, GLOBAL_SETTINGS_QUERY } from '@/sanity/queries'
import { ExperienceDetail, type ExperienceDetailData } from '@/components/detail/ExperienceDetail'
import { LOCALES, localeParam, t } from '@/lib/locale'
import { localeAlternates } from '@/lib/site-url'
import { NotFoundPage, NOT_FOUND_METADATA } from '@/components/NotFoundPage'
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

/**
 * The set generated above is the whole set.
 *
 * This was `true` — a server's promise to render a document it had not seen at build
 * time, so a project added in the studio was reachable before the next deploy. The
 * GitHub Pages copy has no server to keep that promise, and Next rejects the
 * combination rather than degrading it; it also has to be a literal, so it cannot be
 * one value per target. `false` is the value both deployments can honour, which
 * leaves them answering the same addresses instead of two sites disagreeing about
 * what exists. A publish now needs a build — which is what the `repository_dispatch`
 * hook in `.github/workflows/deploy.yml` is for.
 */
export const dynamicParams = false

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

  if (!role) return NOT_FOUND_METADATA

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
  if (!role) {
    return (
      <PageTransition>
        <NotFoundPage locale={locale} />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <ExperienceDetail experience={role as unknown as ExperienceDetailData} locale={locale} />
    </PageTransition>
  )
}
