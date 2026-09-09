import { stegaClean } from 'next-sanity'

/** A CSS identifier, which is what a view transition name has to be. */
const SAFE = /^[a-zA-Z0-9_-]+$/

/**
 * The name that ties a card to the page it opens.
 *
 * Built from the slug rather than the document id for two reasons: the slug is
 * already unique per document because it is the URL, and it is plain text, where an
 * `_id` read in draft mode arrives stega-encoded and prefixed with `drafts.`.
 *
 * A view transition name has to be unique across everything on screen at the moment
 * the transition runs. That is why only the index-to-detail pair is ever named —
 * "related projects" on a detail page would put a second element under the same name
 * as the page's own heading, and the browser would have no way to choose.
 *
 * Anything that is not a plain slug returns undefined and simply does not
 * participate. A malformed name is worse than no name: it takes the whole transition
 * with it rather than only itself.
 */
export function morphName(
  kind: 'project' | 'experience',
  part: 'cover' | 'title' | 'card',
  slug: string | null | undefined
): string | undefined {
  if (!slug) return undefined
  const clean = stegaClean(slug).trim()
  return SAFE.test(clean) ? `${kind}-${part}-${clean}` : undefined
}
