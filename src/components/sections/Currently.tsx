import { Section, type SectionSettings } from '@/components/Section'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'

export type CurrentlySectionData = {
  _key: string
  _type: 'currentlySection'
  eyebrow?: LocaleString
  title?: LocaleString
  updatedLabel?: LocaleString
  items?: Array<{ _key: string; label?: LocaleString; body?: LocaleText }> | null
  settings?: SectionSettings | null
}

export function Currently({ data, locale }: { data: CurrentlySectionData; locale: Locale }) {
  const items = data.items ?? []

  return (
    <Section settings={data.settings}>
      <div className="now-grid">
        <div>
          {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
          {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
          {t(data.updatedLabel, locale) && (
            <p className="now-updated">{t(data.updatedLabel, locale)}</p>
          )}
        </div>

        {items.length > 0 && (
          <div className="now-list">
            {items.map((item) => (
              <div key={item._key} className="now-row">
                <span className="now-label">{t(item.label, locale)}</span>
                <span className="now-body">{t(item.body, locale)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
