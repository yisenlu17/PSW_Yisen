import { stegaClean } from 'next-sanity'

import { isLocale, type Locale } from './locale'

/**
 * Characters that mean the value is not a slug: a path separator, a URL scheme's
 * colon, a query or fragment marker, or whitespace.
 */
const NOT_A_SLUG = /[/\:?#[\]@\s]/

/** Anything with a scheme, or protocol-relative — not ours to prefix. */
const ABSOLUTE = /^([a-z][a-z0-9+.-]*:|\/\/)/i

/** The site's own root, in one language. */
export function homeHref(locale: Locale): string {
  return `/${locale}`
}

/**
 * Builds `/<locale>/projects/<slug>` or `/<locale>/experience/<slug>`, or null when
 * the slug cannot be one.
 *
 * A slug is a single path segment, but the studio's slug field will accept anything
 * typed into it — this project shipped with `https://woshidongqiuwang.com/` in a
 * project's slug, and every card linking to it landed on a 404. Returning null lets
 * the caller fall back to plain text, which is what it already does for a document
 * with no slug at all: no link is better than a link to nowhere.
 */
export function detailHref(
  base: 'projects' | 'experience',
  slug: string | null | undefined,
  locale: Locale
): string | null {
  if (!slug) return null
  const clean = stegaClean(slug).trim()
  if (!clean || NOT_A_SLUG.test(clean)) return null
  return `/${locale}/${base}/${encodeURIComponent(clean)}`
}

/**
 * Puts an editor's link into the language being read.
 *
 * Navigation, buttons and bento tiles all carry a path typed into the studio, and an
 * editor types `/projects` — they should not have to know the site has language
 * prefixes at all, let alone maintain two copies of every menu. So the prefix is
 * added here, at the point of rendering, in whichever language the page is in.
 *
 * Left alone: anything with a scheme (an external site, `mailto:`, `tel:`), a bare
 * fragment (`#contact` means *this* page), and a path already carrying a locale —
 * that last one so a link deliberately pointing across languages survives.
 */
export function localizeHref(
  href: string | null | undefined,
  locale: Locale
): string | null {
  if (!href) return null
  const clean = stegaClean(href).trim()
  if (!clean) return null
  if (ABSOLUTE.test(clean) || clean.startsWith('#')) return clean
  if (!clean.startsWith('/')) return clean

  const [first] = clean.slice(1).split(/[/?#]/, 1)
  if (isLocale(first)) return clean

  return clean === '/' ? `/${locale}` : `/${locale}${clean}`
}

/**
 * The current path, read in another language.
 *
 * What the language menu links to. Only the first segment moves, so switching
 * language on a project keeps you on that project rather than dropping you at the
 * homepage — which is the whole reason the language is in the URL.
 */
export function swapLocale(pathname: string, to: Locale): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = to
    return `/${segments.join('/')}`
  }
  return `/${[to, ...segments].join('/')}`
}
