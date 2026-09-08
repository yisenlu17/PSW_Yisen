/**
 * Whether this build is the static one.
 *
 * The site has two deployment targets now. Vercel runs it as a server: a proxy picks
 * the language for the bare domain, draft mode swaps published content for drafts,
 * and a route handler expires the cache when the studio publishes. GitHub Pages is a
 * file server — none of that exists there, and asking for it is a build error rather
 * than a degraded page.
 *
 * So the export build turns those features off at the source instead of letting Next
 * discover them and fail. Set by `scripts/build-static.mjs`; unset everywhere else,
 * which is what keeps `next dev` and the Vercel build exactly as they were.
 */
export const IS_STATIC_EXPORT = process.env.STATIC_EXPORT === '1'
