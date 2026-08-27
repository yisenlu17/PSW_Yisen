import { revalidateTag } from 'next/cache'
import { parseBody } from 'next-sanity/webhook'
import { NextResponse, type NextRequest } from 'next/server'

import { SANITY_TAG } from '@/sanity/fetch'

/**
 * Publishing in the studio, made visible here.
 *
 * Published content is read through Next's data cache, so without something to expire
 * it an edit would wait out `REVALIDATE_SECONDS`. This is that something: point a
 * Sanity webhook at `/api/revalidate` and a publish clears the cache within the second.
 *
 * `parseBody` verifies the signature against `SANITY_REVALIDATE_SECRET` and — the part
 * worth having — waits for Content Lake to become consistent before returning, so the
 * next visitor's re-read finds the new document rather than the one it replaced.
 *
 * Without the secret set this refuses every request, which is the right way round: an
 * unauthenticated endpoint that can flush the cache is a way to make the site slow on
 * demand. The site still works, one minute behind the studio.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: 'SANITY_REVALIDATE_SECRET is not set' },
      { status: 501 }
    )
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret)

    if (!isValidSignature) {
      return NextResponse.json({ revalidated: false, message: 'Invalid signature' }, { status: 401 })
    }

    // Only that there is a body, not what is in it. A valid signature already means
    // Sanity sent this and something changed, which is the whole question — and
    // insisting on `_type` would let a payload that happens not to carry it, a
    // deletion being the likely one, silently leave the cache holding a document
    // that no longer exists.
    if (!body) {
      return NextResponse.json({ revalidated: false, message: 'Empty payload' }, { status: 400 })
    }

    // `expire: 0` rather than the recommended `'max'`. `'max'` marks the entry stale
    // and serves it once more while it refetches, which is the better trade for a
    // busy feed and the wrong one here: the editor who just pressed Publish reloads
    // the page immediately, and being shown what they replaced reads as a failure.
    // The cost is one visitor waiting on one Sanity read, which is what every visitor
    // was paying before any of this was cached.
    revalidateTag(SANITY_TAG, { expire: 0 })

    return NextResponse.json({ revalidated: true, type: body._type ?? null, now: Date.now() })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ revalidated: false, message }, { status: 500 })
  }
}
