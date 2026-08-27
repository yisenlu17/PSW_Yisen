'use client'

import { useEffect } from 'react'

/**
 * The studio authenticates with a bearer token, so `@sanity/client` cannot use the
 * browser's own EventSource for its listener streams — those need a request header —
 * and falls back to `event-source-polyfill`. That polyfill re-opens the stream any
 * time 45 seconds pass with no bytes on it, and announces the reconnect by calling
 * `console.error` itself. Sanity's /listen endpoint sends a keep-alive every 15
 * seconds, so such a gap only ever means this tab stopped reading — it was frozen in
 * the background, or the machine slept — never that the connection failed. The
 * polyfill reconnects on its own and the studio carries on.
 *
 * Next's dev overlay hooks `console.error` and nothing else, so a routine reconnect
 * gets reported as a Console Error over the whole studio. Demote just that one line
 * to `console.debug`: it stays in the console, it stops being reported as a fault.
 *
 * `@sanity/client` 8 drops the polyfill for the modern `eventsource` package, which
 * reconnects quietly. Delete this once the studio's dependency tree moves to it — as
 * of sanity 6.10 it is still pinned to ^7.
 */
const RECONNECT_NOTICE = /^No activity within \d+ milliseconds\. .* Reconnecting\.$/

export function QuietSanityReconnects() {
  useEffect(() => {
    const original = console.error

    const patched = (...args: unknown[]) => {
      const [first] = args
      if (args.length === 1 && first instanceof Error && RECONNECT_NOTICE.test(first.message)) {
        console.debug(first)
        return
      }
      original.apply(console, args)
    }

    console.error = patched

    return () => {
      // Only unwind our own layer: a hot reload can stack another patch on top, and
      // restoring blindly would take that one with it.
      if (console.error === patched) console.error = original
    }
  }, [])

  return null
}
