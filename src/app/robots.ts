import type { MetadataRoute } from 'next'

import { siteOrigin } from '@/lib/site-url'

/**
 * A file, not an answer. Next treats a metadata route as dynamic until told
 * otherwise, and a file host has nothing to be dynamic with — `output: export` fails
 * on the route rather than emitting it. Nothing here varies by request in the first
 * place: the origin comes from the environment and the rules are written above.
 */
export const dynamic = 'force-static'

/**
 * The studio is an editing tool behind a login and the API routes are plumbing;
 * neither is a page, and both would only ever dilute what the site is found for.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/'],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  }
}
