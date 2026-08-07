import { defineLive } from 'next-sanity/live'
import { client } from './client'

/**
 * `sanityFetch` reads published content in production and draft content whenever
 * draft mode is on, so Preview and Publish are the same code path with a different
 * perspective. `<SanityLive />` keeps an open connection so an edit in the studio
 * shows up without a reload.
 *
 * SANITY_API_READ_TOKEN is server-only. It is deliberately not passed as
 * `browserToken`: drafts are viewable inside Presentation, which authenticates the
 * editor, and nowhere else.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN,
})
