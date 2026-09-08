// Same guard as the client itself: a read token rides along on every request below,
// and importing this from a Client Component must fail the build rather than ship it.
import 'server-only'

import { cache } from 'react'
import { draftMode } from 'next/headers'

import { IS_STATIC_EXPORT } from '@/lib/static-export'
import { client } from './client'
import { sanityFetch as liveFetch } from './live'

/**
 * How long a published read is reused before Sanity is asked again.
 *
 * The backstop rather than the mechanism: `/api/revalidate` expires these the moment
 * something is published, so the minute only matters when that webhook has not been
 * set up — or has just failed. Long enough that a burst of visitors costs one query,
 * short enough that a missed webhook is a delay rather than a stuck page.
 */
export const REVALIDATE_SECONDS = 60

/**
 * The one tag every published read carries.
 *
 * Per-document tags would let a publish expire only the pages quoting that document,
 * but every page here is assembled from the same handful — global settings,
 * navigation, the section list — so the honest blast radius is "all of it" either
 * way, and one tag is one thing to get right in the webhook.
 */
export const SANITY_TAG = 'sanity:content'

/**
 * A cached read of published content.
 *
 * `next.revalidate` is what puts the result in Next's data cache; without it the
 * fetch goes to the network, since an unannotated `fetch` has been uncached by
 * default since Next 15.
 *
 * `useCdn` is on, unlike the base client. That client is configured for the studio's
 * needs, where a CDN underneath preview would hand an editor back the draft they had
 * just replaced. Nothing here is preview — draft mode never reaches this function —
 * so the CDN is simply the faster of two ways to read the same published document.
 *
 * `cache()` from React collapses the duplicates inside one request. Rendering a page
 * asks for global settings three times — the layout for the favicon and the masthead,
 * `generateMetadata` for the title, the page for whatever section wants a portrait —
 * and this makes the second and third free rather than merely cheap. Params are keyed
 * as JSON because `cache` compares arguments by identity, and `{ slug }` built at two
 * call sites is two objects holding one value.
 */
const readPublished = cache(async (query: string, paramsJson: string): Promise<unknown> =>
  client.fetch(query, JSON.parse(paramsJson) as Record<string, unknown>, {
    useCdn: true,
    perspective: 'published',
    stega: false,
    next: { revalidate: REVALIDATE_SECONDS, tags: [SANITY_TAG] },
  })
)

/** Key order decides the cache key, and object literals are not written in one order. */
function keyFor(params: Record<string, unknown> | undefined): string {
  if (!params) return '{}'
  const sorted = Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)))
  return JSON.stringify(sorted)
}

type SanityFetch = typeof liveFetch

/**
 * Reads content: cached when it is published, live when it is a draft.
 *
 * Deliberately the same signature as `defineLive`'s own `sanityFetch`, so a call site
 * swaps one import and keeps its types — stega branding included, which `stega: false`
 * still turns off for the metadata reads that must not carry it.
 *
 * The reason for existing is one line inside `next-sanity`: its `sanityFetch` issues
 * *two* requests per call, and only the second — the one that returns the content —
 * is given `next: { … }`. The first asks the Live Content API which sync tags the
 * result depends on, is annotated with nothing, and therefore goes to the network
 * every single time, on every request, forever. A page here calls `sanityFetch` seven
 * times: the layout for settings, navigation and the drop-down children, the page for
 * its content and settings again, `generateMetadata` for both once more. That is
 * seven uncached round trips to Sanity before a byte of HTML is written — which is
 * slow when the network behaves, and visibly uneven when it does not.
 *
 * Those sync tags are worth paying for when `<SanityLive />` is listening, because
 * they are what it revalidates. For a visitor reading published content nothing is
 * listening, so the whole exchange is bought and thrown away. Draft mode keeps it:
 * an editor in Presentation *is* listening, and wants the drafts perspective and
 * stega-encoded strings that `defineLive` resolves from the cookies for itself.
 */
export const sanityFetch = (async (options: Parameters<SanityFetch>[0]) => {
  // `draftMode()` reads a cookie off the request, and a build producing files rather
  // than answering requests has none — Next treats the call itself as the error, so it
  // has to be skipped rather than have its answer ignored. Nothing is lost: preview
  // needs a server to swap the perspective, and the static site has no studio in front
  // of it to preview from.
  const isDraft = IS_STATIC_EXPORT ? false : (await draftMode()).isEnabled

  if (isDraft) return liveFetch(options)

  const params = await options.params
  const data = await readPublished(options.query, keyFor(params))

  return { data, sourceMap: null, tags: [SANITY_TAG] }
}) as SanityFetch
