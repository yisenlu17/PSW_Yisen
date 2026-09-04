import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { renderPage, pageMetadata } from '@/lib/render-page'
import { LOCALES, localeParam } from '@/lib/locale'

/** There are two languages and there is one homepage, so this is the whole set. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

/** Unlike the content routes, nothing can be added here later — two is all there is. */
export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = localeParam((await params).locale)
  return locale ? pageMetadata('/', locale) : {}
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeParam((await params).locale)
  if (!locale) notFound()
  return renderPage('/', locale)
}
