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

/**
 * There was an `experimental.staleTimes` override here, raising the client router
 * cache off zero because every route was dynamic — the language came from a cookie,
 * and a cookie cannot be prerendered. The language is a path segment now, the routes
 * prerender, and static segments already get five minutes by default. The override
 * was answering a question that is no longer asked.
 */
const nextConfig: NextConfig = {
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
