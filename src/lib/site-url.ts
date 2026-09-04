import { HREFLANG, LOCALES, type Locale } from './locale'

/**
 * Where this site lives, as an absolute origin.
 *
 * Needed the moment anything has to name itself from the outside: a share card's
 * image, a canonical link, an `hreflang` pointing at the other language, a sitemap
 * entry. All of those are read by machines that have no idea what the current
 * request was, so a relative path is not an answer.
 *
 * Vercel supplies the production domain to every build, so the explicit variable is
 * only needed for a custom domain the project does not know about yet — and for
 * `next dev`, where the fallback keeps everything pointing somewhere real rather
 * than throwing.
 */
export function siteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (production) return `https://${production}`

  return 'http://localhost:3000'
}

/** The origin as a `URL`, which is the shape `metadataBase` wants. */
export function metadataBase(): URL {
  return new URL(siteOrigin())
}

/**
 * The canonical address of a page, and the same page in every other language.
 *
 * This is what the language-in-the-URL change was for. One address serving both
 * languages gave a search engine nothing to index but the English, and no way to
 * offer a Chinese reader the Chinese version; a pair of addresses that each declare
 * the other is a thing it knows what to do with.
 *
 * `path` is everything after the language — '' for a homepage, '/projects/vora' for
 * a project — so a caller never has to remember which side of it the slash is on.
 */
export function localeAlternates(locale: Locale, path: string): {
  canonical: string
  languages: Record<string, string>
} {
  const origin = siteOrigin()
  const tail = path && !path.startsWith('/') ? `/${path}` : path

  return {
    canonical: `${origin}/${locale}${tail}`,
    languages: Object.fromEntries(
      LOCALES.map((each) => [HREFLANG[each], `${origin}/${each}${tail}`])
    ),
  }
}
