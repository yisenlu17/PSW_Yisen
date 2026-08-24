import { stegaClean } from 'next-sanity'

/**
 * Characters that mean the value is not a slug: a path separator, a URL scheme's
 * colon, a query or fragment marker, or whitespace.
 */
const NOT_A_SLUG = /[/\:?#[\]@\s]/

/**
 * Builds `/projects/<slug>` or `/experience/<slug>`, or null when the slug cannot
 * be one.
 *
 * A slug is a single path segment, but the studio's slug field will accept anything
 * typed into it — this project shipped with `https://woshidongqiuwang.com/` in a
 * project's slug, and every card linking to it landed on a 404. Returning null lets
 * the caller fall back to plain text, which is what it already does for a document
 * with no slug at all: no link is better than a link to nowhere.
 */
export function detailHref(
  base: 'projects' | 'experience',
  slug: string | null | undefined
): string | null {
  if (!slug) return null
  const clean = stegaClean(slug).trim()
  if (!clean || NOT_A_SLUG.test(clean)) return null
  return `/${base}/${encodeURIComponent(clean)}`
}
