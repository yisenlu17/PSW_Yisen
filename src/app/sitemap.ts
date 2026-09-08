import type { MetadataRoute } from 'next'

import { client } from '@/sanity/client'
import {
  EXPERIENCE_SLUGS_QUERY,
  PAGE_SLUGS_QUERY,
  PROJECT_SLUGS_QUERY,
} from '@/sanity/queries'
import { HREFLANG, LOCALES } from '@/lib/locale'
import { siteOrigin } from '@/lib/site-url'
import { IS_STATIC_EXPORT } from '@/lib/static-export'

/**
 * Same as `robots.ts`: emitted as a file at build time rather than answered per
 * request. The queries below still run — at build, alongside the ones that decide
 * which pages to prerender — so the sitemap lists exactly what was built, which is
 * the only claim it can honestly make on a static host.
 */
export const dynamic = 'force-static'

/**
 * Every address on the site, in every language, each declaring the others.
 *
 * Built from the CMS rather than written down, so publishing a project puts it in
 * the sitemap without anyone remembering to. The slug queries are the same ones the
 * routes use to decide what to prerender, which is what keeps the two in step.
 *
 * `alternates.languages` is the half that matters for a bilingual site: it is how a
 * search engine learns that two URLs are one page in two languages rather than two
 * pages saying the same thing, which is what it would otherwise conclude.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, projects, roles] = await Promise.all([
    client.fetch(PAGE_SLUGS_QUERY),
    client.fetch(PROJECT_SLUGS_QUERY),
    client.fetch(EXPERIENCE_SLUGS_QUERY),
  ])

  const clean = (slugs: (string | null)[] | null) =>
    (slugs ?? []).filter((s): s is string => Boolean(s))

  const paths = [
    '',
    ...clean(pages)
      .filter((slug) => slug !== '/')
      .map((slug) => `/${slug}`),
    ...clean(projects).map((slug) => `/projects/${slug}`),
    ...clean(roles).map((slug) => `/experience/${slug}`),
  ]

  const origin = siteOrigin()
  const lastModified = new Date()

  /**
   * The static build serves every route as a directory, so its pages declare
   * themselves canonical *with* a trailing slash. Next normalises the metadata but
   * not the sitemap, which left the two disagreeing about the same page — the one
   * mismatch a sitemap exists to not have.
   */
  const address = (locale: string, path: string) => {
    const url = `${origin}/${locale}${path}`
    return IS_STATIC_EXPORT && !url.endsWith('/') ? `${url}/` : url
  }

  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: address(locale, path),
      lastModified,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((each) => [HREFLANG[each], address(each, path)])
        ),
      },
    }))
  )
}
