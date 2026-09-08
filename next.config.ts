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

/**
 * The static build, for GitHub Pages.
 *
 * Vercel is unreachable from mainland China, which is half the audience for a
 * bilingual CV, so the site also ships as plain files. `scripts/build-static.mjs`
 * sets this; nothing else does, so `next dev` and the Vercel build read the config
 * below exactly as they did before.
 */
const isStaticExport = process.env.STATIC_EXPORT === '1'

/**
 * The repository name, because Pages serves a project site under it —
 * `yisenlu17.github.io/PSW_Yisen`, not the root. Every asset URL, every `<Link>` and
 * every router push has to carry that prefix or land on a 404, which is what
 * `basePath` is for. Overridable so moving the site to a custom domain, where the
 * prefix disappears, is an environment variable rather than an edit.
 */
const basePath = process.env.STATIC_BASE_PATH ?? '/PSW_Yisen'

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

if (isStaticExport) {
  nextConfig.output = 'export'

  if (basePath) {
    nextConfig.basePath = basePath
    nextConfig.assetPrefix = basePath
  }

  /**
   * Pages resolves a directory to its `index.html` and is inconsistent about
   * inferring `.html` from an extensionless path. Trailing slashes make every route
   * a directory with an index in it, which is the one shape it never gets wrong.
   */
  nextConfig.trailingSlash = true

  /**
   * Not `unoptimized` — see `src/sanity/image-loader.ts`. The images are already on a
   * CDN that resizes, so the srcset survives the move to a file host.
   */
  nextConfig.images = {
    loader: 'custom',
    loaderFile: './src/sanity/image-loader.ts',
  }
}

export default nextConfig
