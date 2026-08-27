import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { t, formatDateRange, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import { roleCompany, type ExperienceRole } from '@/lib/experience'
import { detailHref } from '@/lib/href'
import { ExperienceCard } from './ExperienceCard'

export type { ExperienceRole }

export type ExperienceSectionData = {
  _key: string
  _type: 'experienceSection'
  eyebrow?: LocaleString
  title?: LocaleString
  lede?: LocaleText
  variant?: 'cardsAndList' | 'cards' | 'timeline' | null
  compact?: boolean | null
  limit?: number | null
  roles?: ExperienceRole[] | null
  settings?: SectionSettings | null
}

export function ExperienceSection({
  data,
  locale,
}: {
  data: ExperienceSectionData
  locale: Locale
}) {
  const variant = stegaClean(data.variant ?? 'cardsAndList')
  // The query slices to a fixed ceiling because GROQ needs literal bounds; the
  // editor's own limit is applied here.
  const limit = data.limit ?? undefined
  const roles = limit ? (data.roles ?? []).slice(0, limit) : (data.roles ?? [])

  // Compact is the homepage setting: one line per card, nothing opens, and the detail
  // stays where it belongs. It also rules out the "and the rest" list — a page that is
  // pointing somewhere else should not also carry the long tail.
  const compact = data.compact === true

  // `cards` promotes everything; `cardsAndList` honours the per-role Featured flag.
  // Falling back to "all cards" when nothing is featured avoids an empty-looking
  // section the first time someone adds roles and forgets the tickbox.
  const featured =
    variant === 'cards' || !roles.some((r) => r.featured) ? roles : roles.filter((r) => r.featured)
  const rest = variant === 'cardsAndList' && !compact ? roles.filter((r) => !featured.includes(r)) : []

  return (
    <Section settings={data.settings}>
      <div className="section-head">
        {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
        {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
        {t(data.lede, locale) && <p className="lede">{t(data.lede, locale)}</p>}
      </div>

      {featured.length > 0 && (
        <div
          className={variant === 'timeline' && !compact ? 'exp-timeline' : 'exp-cards'}
          data-compact={compact || undefined}
        >
          {featured.map((role) => (
            <ExperienceCard key={role._id} role={role} locale={locale} compact={compact} />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="exp-list">
          {rest.map((role) => (
            <ExperienceRow key={role._id} role={role} locale={locale} />
          ))}
        </div>
      )}
    </Section>
  )
}

/**
 * Company names link to the role's own page when it has a slug. A role created
 * without one still renders — as plain text rather than a link to nowhere.
 */
function RoleName({ role, locale }: { role: ExperienceRole; locale: Locale }) {
  const href = detailHref('experience', role.slug)
  const company = roleCompany(role, locale)
  return href ? <Link href={href}>{company}</Link> : <>{company}</>
}

function ExperienceRow({ role, locale }: { role: ExperienceRole; locale: Locale }) {
  const dates = formatDateRange(role.startDate, role.endDate, locale)
  return (
    <div className="exp-row">
      <div>
        <h3><RoleName role={role} locale={locale} /></h3>
        <p className="exp-meta">{[t(role.role, locale), dates].filter(Boolean).join(' · ')}</p>
      </div>
      {t(role.summary, locale) && <p className="exp-row-body">{t(role.summary, locale)}</p>}
      {t(role.highlight, locale) && <span className="exp-row-metric">{t(role.highlight, locale)}</span>}
    </div>
  )
}
