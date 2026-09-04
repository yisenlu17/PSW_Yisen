import type { MetadataRoute } from 'next'

import { siteOrigin } from '@/lib/site-url'

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
