import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { renderPage, pageMetadata } from '@/lib/render-page'
import { client } from '@/sanity/client'
import { PAGE_SLUGS_QUERY } from '@/sanity/queries'
import { LOCALES, localeParam } from '@/lib/locale'
import { PageTransition } from '@/components/transitions'

/**
 * Every page other than the homepage, in every language.
 *
 * Slugs are read from the CMS at build time, so a page exists because a document
 * does rather than because someone wrote a route. Both segments are generated here
 * rather than splitting the language out into the layout — the flat product is one
 * list, and one place to read it.
 */
export async function generateStaticParams() {
  const slugs = await client.fetch(PAGE_SLUGS_QUERY)
  const pages = (slugs ?? []).filter((s): s is string => Boolean(s) && s !== '/')
  return LOCALES.flatMap((locale) => pages.map((slug) => ({ locale, slug })))
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
  return locale ? pageMetadata(slug, locale) : {}
}

export default async function SubPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: param, slug } = await params
  const locale = localeParam(param)
  if (!locale) notFound()
  return <PageTransition>{await renderPage(slug, locale)}</PageTransition>
}
