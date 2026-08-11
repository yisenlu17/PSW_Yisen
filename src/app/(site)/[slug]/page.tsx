import type { Metadata } from 'next'

import { renderPage, pageMetadata } from '@/lib/render-page'
import { client } from '@/sanity/client'
import { PAGE_SLUGS_QUERY } from '@/sanity/queries'

/**
 * Every page other than the homepage.
 *
 * Slugs are pre-generated from the CMS so the common pages are built ahead of time,
 * while `dynamicParams` keeps a page created later reachable without a redeploy.
 */
export async function generateStaticParams() {
  const slugs = await client.fetch(PAGE_SLUGS_QUERY)
  return (slugs ?? []).filter((s): s is string => Boolean(s) && s !== '/').map((slug) => ({ slug }))
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return pageMetadata(slug)
}

export default async function SubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return renderPage(slug)
}
