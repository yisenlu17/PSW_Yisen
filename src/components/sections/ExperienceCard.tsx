import Link from 'next/link'

import { copy } from '@/components/detail/DetailChrome'
import { t, formatDateRange, type Locale } from '@/lib/locale'
import { roleCompany, type ExperienceRole } from '@/lib/experience'
import { detailHref } from '@/lib/href'

/**
 * One role, as a card that points at the role's own page.
 *
 * The card carries the identifying line, the company, the role and dates, and one
 * paragraph — enough to tell five roles apart at a glance. Everything else lives on
 * `/experience/<slug>`: skills, what the role actually involved, the numbers, the
 * images. Nothing opens in place, so a visitor scanning the page is never reading a
 * card that has grown three screens tall while its neighbours stayed one.
 *
 * `compact` is the homepage's smaller version — same card, no category line.
 *
 * The link is stretched over the card in CSS rather than wrapping it, so the whole
 * card is one target while the accessible name stays the company; the "learn more"
 * line beside it is the visible affordance, and is hidden from screen readers
 * because it would otherwise announce a second link that does not exist.
 */
export function ExperienceCard({
  role,
  locale,
  compact = false,
}: {
  role: ExperienceRole
  locale: Locale
  compact?: boolean
}) {
  const c = copy(locale)

  const href = detailHref('experience', role.slug, locale)
  const dates = formatDateRange(role.startDate, role.endDate, locale)
  const meta = [t(role.role, locale), dates].filter(Boolean).join(' · ')
  const summary = t(role.summary, locale)
  const category = t(role.category, locale)
  const company = roleCompany(role, locale)

  return (
    <article className={compact ? 'exp-card exp-card-compact' : 'exp-card'}>
      {!compact && category && <span className="exp-kicker">{category}</span>}

      <h3>
        {href ? (
          <Link href={href} className="exp-card-stretch">
            {company}
          </Link>
        ) : (
          company
        )}
      </h3>
      {meta && <p className="exp-meta">{meta}</p>}
      {summary && <p className="exp-body">{summary}</p>}

      {href && (
        <span className="exp-more" aria-hidden>
          {c.learnMore}
          <span className="exp-more-mark">→</span>
        </span>
      )}
    </article>
  )
}
