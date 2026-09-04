/**
 * What a page looks like for the moment before it arrives.
 *
 * This file earns its place twice. It is the feedback — a click used to leave the old
 * page sitting there, unchanged and unmarked, for as long as the server took, which
 * reads as a dead button rather than as a page on its way. And it is the prefetch:
 * without Cache Components, Next declines to prefetch a dynamic route at all unless it
 * finds a loading boundary, and every route here is dynamic because the language comes
 * from a cookie. With one, the shell is fetched while the link is merely in view, and
 * only the content is still to come when it is clicked.
 *
 * Shaped like the page rather than like a spinner: every page on this site opens with
 * a deep navy band — a hero, or a detail header — so the skeleton opens with one too,
 * and the real thing replaces it without the layout jumping underneath.
 */
export default function Loading() {
  return (
    <main className="skeleton" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>

      <div className="skeleton-head">
        <div className="wrap">
          <span className="skeleton-bar skeleton-eyebrow" />
          <span className="skeleton-bar skeleton-title" />
          <span className="skeleton-bar skeleton-title short" />
          <span className="skeleton-bar skeleton-lede" />
        </div>
      </div>

      <div className="wrap skeleton-body">
        <span className="skeleton-bar skeleton-line" />
        <span className="skeleton-bar skeleton-line" />
        <span className="skeleton-bar skeleton-line short" />
      </div>
    </main>
  )
}
