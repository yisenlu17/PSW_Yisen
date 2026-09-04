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
 * Slugs are pre-generated from the CMS so the common pages are built ahead of time,
 * while `dynamicParams` keeps a page created later reachable without a redeploy.
 * Both segments are generated here rather than splitting the language out into the
 * layout — the flat product is one list, and one place to read it.
 */
export async function generateStaticParams() {
  const slugs = await client.fetch(PAGE_SLUGS_QUERY)
  const pages = (slugs ?? []).filter((s): s is string => Boolean(s) && s !== '/')
  return LOCALES.flatMap((locale) => pages.map((slug) => ({ locale, slug })))
}

export const dynamicParams = true

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
