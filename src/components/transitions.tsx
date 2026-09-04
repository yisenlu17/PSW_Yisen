import { ViewTransition, type ReactNode } from 'react'

/**
 * What a navigation means, as the CSS gets to see it.
 *
 * Three kinds, because three things happen on this site and they should not look
 * alike. Going from a card into the page behind it is going deeper; the back link is
 * coming out again; moving between Projects and About is neither — it is the same
 * depth, a different place. Direction is reserved for the first two, so that when
 * something does slide sideways it means something.
 *
 * `default: 'none'` covers everything that arrives without a type: the browser's own
 * back button, a refresh, a Suspense reveal. Those get the shared-element morph if
 * one pairs, and otherwise nothing — which is the right answer for a gesture the
 * browser is already animating itself.
 */
const BY_TYPE = {
  'nav-forward': 'nav-forward',
  'nav-back': 'nav-back',
  'nav-lateral': 'nav-lateral',
  default: 'none',
} as const

/** Passed to `<Link transitionTypes>` — module constants so they keep their identity. */
export const NAV_FORWARD = ['nav-forward']
export const NAV_BACK = ['nav-back']
export const NAV_LATERAL = ['nav-lateral']

/**
 * Wraps a page so it can enter and leave.
 *
 * Belongs in `page.tsx` and nowhere else. A layout persists across a navigation — it
 * is the thing that did *not* change — so enter and exit would never fire from
 * there, and the wrapper has to be the outermost element the page renders or the
 * browser has nothing to snapshot.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={BY_TYPE} exit={BY_TYPE} default="none">
      {children}
    </ViewTransition>
  )
}

/**
 * One element, named, so it can be recognised on the page you are going to.
 *
 * The browser animates between the old and new position and size of anything sharing
 * a name, which is what makes a card's cover appear to grow into the page's own
 * rather than one disappearing while another arrives.
 *
 * `default="none"` stops a named element joining in on every unrelated transition,
 * and `share="morph"` has to be given alongside it — with `default="none"` and no
 * explicit `share`, the pair quietly stops matching and nothing says why.
 */
export function Morph({ name, children }: { name?: string; children: ReactNode }) {
  if (!name) return <>{children}</>

  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  )
}
