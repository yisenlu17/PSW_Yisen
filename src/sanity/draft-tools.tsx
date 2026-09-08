import { VisualEditing } from 'next-sanity/visual-editing'

import { DisableDraftMode } from '@/components/DisableDraftMode'
import { SanityLive } from './live'

/**
 * Everything that only exists while an editor is looking at a draft, behind one
 * import.
 *
 * Grouped not for tidiness but because of what these pull in behind them: `defineLive`
 * registers a Server Action, `VisualEditing` another, and `output: export` refuses a
 * build that contains one — a rule about the module graph, not about whether the
 * component renders. `isDraft` is permanently false in the static build and these
 * still sank it.
 *
 * So the static build puts `draft-tools.static.tsx` here instead and the actions leave
 * with it — a swap rather than a config alias, because Turbopack's `resolveAlias` does
 * not see through the `@/*` paths this project imports by. See
 * `scripts/build-static.mjs`.
 */
export function DraftTools() {
  return (
    <>
      <SanityLive />
      <VisualEditing />
      <DisableDraftMode />
    </>
  )
}
