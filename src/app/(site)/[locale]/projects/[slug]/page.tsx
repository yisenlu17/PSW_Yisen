import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { client } from '@/sanity/client'
import { sanityFetch } from '@/sanity/fetch'
import { PROJECT_QUERY, PROJECT_SLUGS_QUERY, GLOBAL_SETTINGS_QUERY } from '@/sanity/queries'
import { ProjectDetail, type ProjectDetailData } from '@/components/detail/ProjectDetail'
import { LOCALES, localeParam, t } from '@/lib/locale'
import { localeAlternates } from '@/lib/site-url'
import { NotFoundPage, NOT_FOUND_METADATA } from '@/components/NotFoundPage'
import { PageTransition } from '@/components/transitions'

/**
 * `/<locale>/projects/<slug>` exists for every Project document — creating one in the
 * studio publishes a page, with no route to write. Publishing one and building are
 * two steps now rather than one; see `dynamicParams` below.
 */
export async function generateStaticParams() {
  const slugs = await client.fetch(PROJECT_SLUGS_QUERY)
  const projects = (slugs ?? []).filter((s): s is string => Boolean(s))
  return LOCALES.flatMap((locale) => projects.map((slug) => ({ locale, slug })))
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

  const [{ data: project }, { data: settings }] = await Promise.all([
    sanityFetch({ query: PROJECT_QUERY, params: { slug }, stega: false }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false }),
  ])

  if (!project) return NOT_FOUND_METADATA

  const name = settings?.name || 'Yisen Lu'
  const title = t(project.seoTitle, locale) || `${project.title} — ${name}`
  const description =
    t(project.seoDescription, locale) || t(project.summary, locale) || t(project.tagline, locale)

  return {
    title,
    description: description || undefined,
    alternates: localeAlternates(locale, `/projects/${slug}`),
    openGraph: { title, description: description || undefined, type: 'article' },
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: param, slug } = await params
  const locale = localeParam(param)
  if (!locale) notFound()

  const { data: project } = await sanityFetch({ query: PROJECT_QUERY, params: { slug } })
  if (!project) {
    return (
      <PageTransition>
        <NotFoundPage locale={locale} />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <ProjectDetail project={project as unknown as ProjectDetailData} locale={locale} />
    </PageTransition>
  )
}
