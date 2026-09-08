/**
 * `live.ts` for the static build — stand-in, not a reimplementation.
 *
 * `defineLive` is what opens the connection the studio's Presentation view watches an
 * edit through. It also registers a Server Action to revalidate on, and `output:
 * export` rejects a build that *contains* a Server Action anywhere in the graph,
 * reachable or not. `fetch.ts` imports this module for the draft branch and for its
 * types, and every page imports `fetch.ts` — so the action arrived on every page of a
 * site that has no drafts, no studio and no server to run it on.
 *
 * The types are imported as types, which erase, so nothing here reaches the module
 * that holds the action.
 *
 * `sanityFetch` throws rather than returning something empty: the only caller is the
 * draft branch, `IS_STATIC_EXPORT` makes that branch unreachable, and a throw says so
 * out loud instead of quietly serving a blank page if it ever stops being true.
 */
import type { ComponentType } from 'react'
import type { DefinedFetchType, DefinedLiveProps } from 'next-sanity/live'

export const sanityFetch = (() => {
  throw new Error(
    'sanityFetch: the live/draft path does not exist in the static build — see src/sanity/live.static.ts'
  )
}) as DefinedFetchType

export const SanityLive: ComponentType<DefinedLiveProps> = () => null
