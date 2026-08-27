import type { NextConfig } from 'next'

/**
 * Every picture on this site is a Sanity asset, served from Sanity's CDN and resized
 * by `next/image`. The optimiser refuses a host it was not told about, so without
 * this the first cover added to a project does not render — the whole page fails with
 * "hostname is not configured", rather than the image quietly not appearing.
 *
 * Narrowed to this dataset's own path so the optimiser cannot be pointed at another
 * project's images, with the whole of `/images` as the fallback for an environment
 * that has no project id to narrow it with.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

const nextConfig: NextConfig = {
  /**
   * Every route here is dynamic, because the language is read from a cookie and a
   * cookie cannot be prerendered. Next gives dynamic routes a client cache TTL of
   * zero, which means going back to a page you read a moment ago fetches it again
   * from the server — the browser's own Back button included. Half a minute is long
   * enough to make moving around the site feel like moving around one document, and
   * short enough that a publish landing mid-visit is not held back by it.
   */
  experimental: {
    staleTimes: { dynamic: 30, static: 300 },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: projectId ? `/images/${projectId}/**` : '/images/**',
      },
    ],
  },
}

export default nextConfig
