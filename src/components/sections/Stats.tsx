import { Fragment } from 'react'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import { CountUp } from './CountUp'

export type StatsSectionData = {
  _key: string
  _type: 'statsSection'
  eyebrow?: LocaleString
  title?: LocaleString
  note?: LocaleText
  feature?: {
    source?: LocaleString
    value?: LocaleString
    description?: LocaleText
  } | null
  stats?: Array<{
    _key: string
    value?: string | null
    suffix?: string | null
    countTo?: number | null
    label?: LocaleString
    source?: LocaleString
  }> | null
  settings?: SectionSettings | null
}

/** Renders *asterisk-wrapped* runs in gold. Anything else is left alone. */
function highlight(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
      <span key={i} className="stat-accent">
        {part.slice(1, -1)}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  )
}

export function Stats({ data, locale, index }: { data: StatsSectionData; locale: Locale; index?: number }) {
  const stats = data.stats ?? []
  const featureValue = t(data.feature?.value, locale)

  return (
    <Section settings={data.settings} index={index}>
      <div className="stats-head">
        <div>
          {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
          {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
        </div>
        {t(data.note, locale) && <p className="stats-note">{t(data.note, locale)}</p>}
      </div>

      <div className="stats-grid">
        {featureValue && (
          <div className="stat-feature">
            {t(data.feature?.source, locale) && (
              <span className="stat-kicker">{t(data.feature?.source, locale)}</span>
            )}
            <div>
              <div className="stat-feature-value">{highlight(stegaClean(featureValue))}</div>
              {t(data.feature?.description, locale) && (
                <p>{t(data.feature?.description, locale)}</p>
              )}
            </div>
          </div>
        )}

        {stats.map((stat) => {
          const value = stat.value ? stegaClean(stat.value) : ''
          return (
            <div key={stat._key} className="stat-card">
              <div className="stat-value">
                {stat.countTo ? <CountUp to={stat.countTo} display={value} /> : value}
                {stat.suffix && <span className="stat-accent">{stegaClean(stat.suffix)}</span>}
              </div>
              {t(stat.label, locale) && <p className="stat-label">{t(stat.label, locale)}</p>}
              {t(stat.source, locale) && <p className="stat-source">{t(stat.source, locale)}</p>}
            </div>
          )
        })}
      </div>
    </Section>
  )
}
