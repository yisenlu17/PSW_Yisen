import { client } from '@/sanity/client'
import { sanityFetch } from '@/sanity/fetch'
import { GLOBAL_SETTINGS_QUERY, PROJECT_QUERY, PROJECT_SLUGS_QUERY } from '@/sanity/queries'
import { DEFAULT_LOCALE, LOCALES, localeParam, t } from '@/lib/locale'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og'
import { projectTitle } from '@/lib/project'
import type { SiteSettings } from '@/lib/site'

export const alt = 'Project'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export async function generateStaticParams() {
  const slugs = await client.fetch(PROJECT_SLUGS_QUERY)
  const projects = (slugs ?? []).filter((s): s is string => Boolean(s))
  return LOCALES.flatMap((locale) => projects.map((slug) => ({ locale, slug })))
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: param, slug } = await params
  const locale = localeParam(param) ?? DEFAULT_LOCALE

  const [{ data: project }, { data: settings }] = await Promise.all([
    sanityFetch({ query: PROJECT_QUERY, params: { slug }, stega: false }),
    sanityFetch({ query: GLOBAL_SETTINGS_QUERY, stega: false }),
  ])

  const site = (settings ?? null) as SiteSettings | null
  const name = site?.name || 'Yisen Lu'

  return ogImage(
    {
      eyebrow: t(project?.category, locale) || undefined,
      title: project ? projectTitle(project, locale) : name,
      footer: name,
    },
    {
      eyebrow: t(project?.category, DEFAULT_LOCALE) || undefined,
      title: project?.title || name,
      footer: name,
    }
  )
}
