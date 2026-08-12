'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { DetailList, MetricRow, copy } from '@/components/detail/DetailChrome'
import { t, formatDateRange, type Locale } from '@/lib/locale'
import { roleDetail, type ExperienceRole } from '@/lib/experience'

/**
 * One role, as a card that opens where it stands.
 *
 * Two shapes, one component:
 *
 * - **Compact** is the homepage's. Company, role, dates, one line, and the whole card
 *   is a link. Nothing opens, because the homepage's job is to point at the work, not
 *   to reproduce it.
 * - **Expandable** is the Experience page's. The same card grows a toggle that reveals
 *   what the role actually involved, in place, without losing scroll position — the
 *   thing a visitor wants when they are comparing five roles rather than reading one.
 *
 * `/experience/<slug>` survives both. An expanded card is a summary a visitor can skim
 * five of; the page is the long version with the narrative, the images and the files,
 * and it stays a real URL that can be linked to, shared and indexed.
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
  const panelId = useId()
  const [open, setOpen] = useState(false)

  const slug = role.slug ? stegaClean(role.slug) : null
  const href = slug ? `/experience/${slug}` : null
  const dates = formatDateRange(role.startDate, role.endDate, locale)
  const meta = [t(role.role, locale), dates].filter(Boolean).join(' · ')
  const summary = t(role.summary, locale)
  const detail = roleDetail(role, locale)

  if (compact) {
    return (
      <article className="exp-card exp-card-compact">
        <h3>
          {/* The link is stretched over the card in CSS rather than wrapping it, so the
              card is one target without nesting the summary text inside an anchor. */}
          {href ? (
            <Link href={href} className="exp-card-stretch">
              {role.company}
            </Link>
          ) : (
            role.company
          )}
        </h3>
        {meta && <p className="exp-meta">{meta}</p>}
        {summary && <p className="exp-body">{summary}</p>}
      </article>
    )
  }

  return (
    <article className="exp-card" data-open={detail.hasDetail && open}>
      {t(role.category, locale) && <span className="exp-kicker">{t(role.category, locale)}</span>}

      <h3>{href ? <Link href={href}>{role.company}</Link> : role.company}</h3>
      {meta && <p className="exp-meta">{meta}</p>}
      {summary && <p className="exp-body">{summary}</p>}

      {t(role.highlight, locale) && (
        <div className="exp-highlight-wrap">
          <span className="exp-highlight">{t(role.highlight, locale)}</span>
        </div>
      )}

      {/* A role whose detail fields are still empty keeps the card and the link, and
          simply never grows a control that would open onto nothing. */}
      {detail.hasDetail && (
        <>
          <button
            type="button"
            className="exp-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          >
            {open ? c.collapse : c.expand}
            <span className="exp-toggle-mark" aria-hidden>
              ↓
            </span>
          </button>

          {/* Rendered collapsed rather than unmounted so the panel can animate; `inert`
              is what keeps its links and headings out of the tab order and off the
              accessibility tree while it is shut. */}
          <div className="exp-panel" id={panelId} inert={!open}>
            <div className="exp-panel-inner">
              {detail.secondary && (
                <div className="detail-block">
                  <p>{detail.secondary}</p>
                </div>
              )}

              <MetricRow metrics={detail.metrics} />

              <DetailList label={c.responsibilities} items={detail.responsibilities} />
              <DetailList label={c.problemsSolved} items={detail.problems} />

              {detail.skills.length > 0 && (
                <div className="detail-block">
                  <h2>{c.skills}</h2>
                  <div className="detail-tags">
                    {detail.skills.map((skill, i) => (
                      <span key={i} className="detail-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {href && (
                <Link href={href} className="exp-panel-more">
                  {c.fullPage}
                  <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </article>
  )
}
