import Link from 'next/link'
import type { CSSProperties } from 'react'

import { copy } from '@/components/detail/DetailChrome'
import {
  t,
  formatDateRange,
  formatYearRange,
  type Locale,
} from '@/lib/locale'
import { roleCompany, roleLocation, type ExperienceRole } from '@/lib/experience'
import { detailHref } from '@/lib/href'
import { morphName } from '@/lib/view-transition'
import { Morph, NAV_FORWARD } from '@/components/transitions'

/**
 * Five roles as a stack of cards that collapse into each other as you scroll.
 *
 * A row of equal cards asks you to compare five things at once, which is the one
 * thing nobody does with a CV — they read it in order, and they read the current job
 * first. So the cards are read in order here too: each one pins itself under the
 * header, the next one rides up over it, and what stays behind is that card's top
 * edge with its number, company, role and years still legible. By the last role, the
 * four above it have become a contents page for the section.
 *
 * The whole of it is `position: sticky` plus one scroll-driven animation. There is no
 * scroll listener, no measurement, and no JavaScript at all: the offsets come from
 * `--i`, which is the only thing this component computes.
 *
 * Below 900px the stack is off — see motion.css. A card pinned under the header on a
 * phone covers the content you scrolled to read, and five of them leave nothing to
 * read at all.
 */
export function ExperienceStack({
  roles,
  locale,
}: {
  roles: ExperienceRole[]
  locale: Locale
}) {
  const c = copy(locale)

  return (
    // The only number this component works out, and the CSS cannot: how many
    // handovers there are. Five cards make four — the last one is never covered by
    // anything, so it never settles back — and each card takes one of those as its
    // slice of the section's scroll. A stack of three and a stack of six each play
    // out over their own section rather than over a length the stylesheet guessed.
    <ol
      className="exp-stack"
      style={{ '--handovers': Math.max(1, roles.length - 1) } as CSSProperties}
    >
      {roles.map((role, i) => {
        const href = detailHref('experience', role.slug, locale)
        const company = roleCompany(role, locale)
        const where = roleLocation(role, locale)
        const summary = t(role.summary, locale)
        const highlight = t(role.highlight, locale)
        const category = t(role.category, locale)

        // The card is the thing that morphs into the page it opens, so the heading
        // inside it is deliberately not named as well. Two named boxes, one inside
        // the other, are snapshotted separately and the inner one is cut out of the
        // outer one's picture — which is a hole in the card for the length of the
        // transition.
        const name = morphName('experience', 'card', role.slug)

        const card = (
          <article className="exp-stack-card">
            {/* The strip that survives being covered. Everything in it is what you
                would want on the spine of a folder: which one, whose, what, when. */}
            <div className="exp-stack-edge">
              <span className="exp-stack-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="exp-stack-co">{company}</span>
              <span className="exp-stack-role">{t(role.role, locale)}</span>
              <span className="exp-stack-years">
                {formatYearRange(role.startDate, role.endDate, locale)}
              </span>
            </div>

            <div className="exp-stack-body">
              <div className="exp-stack-lines">
                {category && <span className="exp-kicker">{category}</span>}
                {summary && <p className="exp-stack-summary">{summary}</p>}
                <p className="exp-stack-meta">
                  {[formatDateRange(role.startDate, role.endDate, locale), where]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              <div className="exp-stack-side">
                {highlight && <span className="exp-stack-metric">{highlight}</span>}
                {href && (
                  <span className="exp-more" aria-hidden>
                    {c.learnMore}
                    <span className="exp-more-mark">→</span>
                  </span>
                )}
              </div>
            </div>
          </article>
        )

        return (
          <li key={role._id} className="exp-stack-slot" style={{ '--i': i } as CSSProperties}>
            {href ? (
              // One anchor around the whole card rather than a stretched pseudo-
              // element: a sticky card is its own stacking context, and an `::after`
              // spread over it lands under the card that has ridden up on top.
              <Link href={href} className="exp-stack-link" transitionTypes={NAV_FORWARD}>
                <Morph name={name}>{card}</Morph>
              </Link>
            ) : (
              <Morph name={name}>{card}</Morph>
            )}
          </li>
        )
      })}
    </ol>
  )
}
