'use client'

/**
 * The image loader for the static build.
 *
 * `next/image`'s default loader is a server that resizes on demand, and a file host
 * has no server — which is why Next refuses the default loader under `output:
 * export` outright. The usual answer is `unoptimized: true`, but that ships one fixed
 * size to every screen, and this is a portfolio read over a slow link from the other
 * side of a firewall.
 *
 * Every `src` here is already a Sanity CDN URL built by `urlFor` or `cropFor`, and
 * that CDN resizes from query parameters. So the optimiser Next wanted exists — it
 * just lives at the far end of the URL. This hands each srcset width to it and lets
 * `next/image` pick between them.
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  // A local file — an SVG out of `public/` — has no CDN behind it to ask.
  if (!src.startsWith('https://cdn.sanity.io/')) return src

  const url = new URL(src)

  /**
   * `cropFor` asks for a width *and* a height, and that pair is the shape the design
   * chose — a square avatar, a 4:3 panel. Overwriting only the width leaves the old
   * height behind and the CDN crops to whatever the two now describe: the 96×96
   * portrait in the masthead came back as 48×96 at 1x, a face cut in half.
   *
   * So the height is rescaled with the width rather than replaced or dropped.
   * Dropping it would be wrong in the other direction — the aspect is the point.
   */
  const previous = Number(url.searchParams.get('w'))
  const height = Number(url.searchParams.get('h'))
  if (previous > 0 && height > 0) {
    url.searchParams.set('h', String(Math.round((height / previous) * width)))
  }

  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  return url.toString()
}
