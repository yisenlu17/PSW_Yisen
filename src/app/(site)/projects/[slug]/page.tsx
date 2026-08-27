import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { client } from '@/sanity/client'
import { sanityFetch } from '@/sanity/fetch'
import { PROJECT_QUERY, PROJECT_SLUGS_QUERY, GLOBAL_SETTINGS_QUERY } from '@/sanity/queries'
import { ProjectDetail, type ProjectDetailData } from '@/components/detail/ProjectDetail'
import { getLocale } from '@/lib/locale-server'
import { t } from '@/lib/locale'

/**
 * `/projects/<slug>` exists for every Project document — creating one in the studio
 * publishes a page, with no route to write. `dynamicParams` keeps a project added
 * after the last build reachable straight away.
 */
export async function generateStaticParams() {
  const slugs = await client.fetch(PROJECT_SLUGS_QUERY)
  return (slugs ?? []).filter((s): s is string => Boolean(s)).map((slug) => ({ slug }))
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [locale, { data: project }, { data: settings }] = await Promise.all([
    getLocale(),
    sanityFetch({ query: PROJECT_QUERY, params: { slug }, stega: false }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false }),
  ])

  if (!project) return {}

  const name = settings?.name || 'Yisen Lu'
  const title = t(project.seoTitle, locale) || `${project.title} — ${name}`
  const description =
    t(project.seoDescription, locale) || t(project.summary, locale) || t(project.tagline, locale)

  return {
    title,
    description: description || undefined,
    openGraph: { title, description: description || undefined, type: 'article' },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [locale, { data: project }] = await Promise.all([
    getLocale(),
    sanityFetch({ query: PROJECT_QUERY, params: { slug } }),
  ])

  if (!project) notFound()

  return <ProjectDetail project={project as unknown as ProjectDetailData} locale={locale} />
}
