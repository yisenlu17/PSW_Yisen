import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { t, formatDateRange, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'

export type ExperienceRole = {
  _id: string
  company?: string | null
  slug?: string | null
  role?: LocaleString
  category?: LocaleString
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  featured?: boolean | null
  summary?: LocaleText
  secondary?: LocaleText
  highlight?: LocaleString
  skills?: string[] | null
}

export type ExperienceSectionData = {
  _key: string
  _type: 'experienceSection'
  eyebrow?: LocaleString
  title?: LocaleString
  lede?: LocaleText
  variant?: 'cardsAndList' | 'cards' | 'timeline' | null
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

  // `cards` promotes everything; `cardsAndList` honours the per-role Featured flag.
  // Falling back to "all cards" when nothing is featured avoids an empty-looking
  // section the first time someone adds roles and forgets the tickbox.
  const featured =
    variant === 'cards' || !roles.some((r) => r.featured) ? roles : roles.filter((r) => r.featured)
  const rest = variant === 'cardsAndList' ? roles.filter((r) => !featured.includes(r)) : []

  return (
    <Section settings={data.settings}>
      <div className="section-head">
        {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
        {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
        {t(data.lede, locale) && <p className="lede">{t(data.lede, locale)}</p>}
      </div>

      {featured.length > 0 && (
        <div className={variant === 'timeline' ? 'exp-timeline' : 'exp-cards'}>
          {featured.map((role) => (
            <ExperienceCard key={role._id} role={role} locale={locale} />
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
function RoleName({ role }: { role: ExperienceRole }) {
  const slug = role.slug ? stegaClean(role.slug) : null
  return slug ? <Link href={`/experience/${slug}`}>{role.company}</Link> : <>{role.company}</>
}

function ExperienceCard({ role, locale }: { role: ExperienceRole; locale: Locale }) {
  const dates = formatDateRange(role.startDate, role.endDate, locale)
  return (
    <article className="exp-card">
      {t(role.category, locale) && <span className="exp-kicker">{t(role.category, locale)}</span>}
      <h3><RoleName role={role} /></h3>
      <p className="exp-meta">
        {[t(role.role, locale), dates].filter(Boolean).join(' · ')}
      </p>
      {t(role.summary, locale) && <p className="exp-body">{t(role.summary, locale)}</p>}
      {t(role.secondary, locale) && <p className="exp-body exp-body-soft">{t(role.secondary, locale)}</p>}
      {t(role.highlight, locale) && (
        <div className="exp-highlight-wrap">
          <span className="exp-highlight">{t(role.highlight, locale)}</span>
        </div>
      )}
    </article>
  )
}

function ExperienceRow({ role, locale }: { role: ExperienceRole; locale: Locale }) {
  const dates = formatDateRange(role.startDate, role.endDate, locale)
  return (
    <div className="exp-row">
      <div>
        <h3><RoleName role={role} /></h3>
        <p className="exp-meta">{[t(role.role, locale), dates].filter(Boolean).join(' · ')}</p>
      </div>
      {t(role.summary, locale) && <p className="exp-row-body">{t(role.summary, locale)}</p>}
      {t(role.highlight, locale) && <span className="exp-row-metric">{t(role.highlight, locale)}</span>}
    </div>
  )
}
