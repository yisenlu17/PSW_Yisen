// Importing this module from a Client Component is a build error. The client below
// carries a read token, so this guard is what keeps that token out of the browser
// bundle rather than a convention someone has to remember.
import 'server-only'

import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from './env'

/**
 * Server-side Sanity client.
 *
 * The dataset is not anonymously readable — this project uses role-based access
 * control, and the anonymous group has no read grant — so every query needs the
 * token. All reads happen in Server Components and route handlers, so the token
 * stays on the server.
 *
 * `useCdn` is off deliberately: the Live Content API already handles freshness, and
 * a CDN cache layered under preview would serve stale content to an editor who has
 * just published something.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  // Encodes field paths into strings during preview so clicking rendered text can
  // open the field that produced it. Inert outside preview.
  stega: { studioUrl: '/studio' },
})
