'use client'

import { useRouter } from 'next/navigation'
import { useSyncExternalStore, useTransition } from 'react'

const subscribe = () => () => {}

/**
 * Escape hatch out of draft mode.
 *
 * Hidden inside Presentation, where the studio already owns the perspective toggle
 * and a second control would just be confusing. It only appears when someone has
 * landed on a draft URL in a normal tab and needs a way back to published content.
 */
export function DisableDraftMode() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const isInsidePresentation = useSyncExternalStore(
    subscribe,
    () => window.self !== window.top,
    () => true
  )

  if (isInsidePresentation) return null

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch('/api/draft-mode/disable')
          router.refresh()
        })
      }
      className="draft-mode-exit"
    >
      {pending ? 'Leaving preview…' : 'Preview mode — click to exit'}
    </button>
  )
}
