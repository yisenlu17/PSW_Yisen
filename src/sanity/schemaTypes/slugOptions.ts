import type { SlugOptions, SlugRule } from 'sanity'

/** A value that cannot be one path segment. */
const NOT_A_SLUG = /[/\:?#[\]@\s]/

/**
 * Reduces anything typed into a slug field to a single path segment.
 *
 * The interesting case is a pasted URL. `https://example.com/work/atlas` is about
 * `atlas`, and `https://woshidongqiuwang.com/` is about `woshidongqiuwang` — the
 * scheme, the host decoration and the TLD identify a server, not a page. Host
 * stripping only applies when the input really was a URL, so a title that happens
 * to contain a dot keeps it.
 */
export function slugifyPath(input: string): string {
  const raw = input.trim().toLowerCase()
  const wasUrl = /^[a-z][a-z\d+.-]*:\/\//.test(raw) || raw.startsWith('www.')

  const parts = raw
    .replace(/^[a-z][a-z\d+.-]*:\/\//, '')
    .replace(/[?#].*$/, '')
    .split('/')
    .filter(Boolean)

  // More than one segment means the host is not the last one, so the last one is
  // the page. A lone segment is the host itself when the input was a URL.
  let segment = parts.length > 1 ? parts[parts.length - 1] : (parts[0] ?? '')
  if (parts.length <= 1 && wasUrl) segment = segment.replace(/^www\./, '').split('.')[0]

  return segment
    .replace(/[^\p{Letter}\p{Number}._~-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

/** Slug field options: generate from `source`, and never generate a non-slug. */
export function slugFrom(source: string): SlugOptions {
  return { source, maxLength: 96, slugify: slugifyPath }
}

/**
 * Refuses a slug that is not one path segment, so a URL pasted straight into the
 * field is caught at publish rather than as a 404 on the live site. The homepage's
 * "/" is the one deliberate exception.
 */
export function slugRule(rule: SlugRule, { allowRoot = false } = {}) {
  return rule.required().custom((value) => {
    const current = value?.current?.trim()
    if (!current) return 'Required.'
    if (allowRoot && current === '/') return true
    if (NOT_A_SLUG.test(current)) {
      return 'A slug is one path segment — not a full URL. Use Generate to fix it.'
    }
    return true
  })
}
