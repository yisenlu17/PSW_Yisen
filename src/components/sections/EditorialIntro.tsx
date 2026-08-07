import { Section, type SectionSettings } from '@/components/Section'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'

export type EditorialIntroSectionData = {
  _key: string
  _type: 'editorialIntroSection'
  eyebrow?: LocaleString
  title?: LocaleString
  lede?: LocaleText
  note?: LocaleText
  steps?: Array<{ _key: string; title?: LocaleString; body?: LocaleText }> | null
  settings?: SectionSettings | null
}

export function EditorialIntro({
  data,
  locale,
}: {
  data: EditorialIntroSectionData
  locale: Locale
}) {
  const steps = data.steps ?? []

  return (
    <Section settings={data.settings}>
      <div className="section-head intro-head">
        {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
        {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
        {t(data.lede, locale) && <p className="lede">{t(data.lede, locale)}</p>}
        {t(data.note, locale) && <p className="intro-note">{t(data.note, locale)}</p>}
      </div>

      {steps.length > 0 && (
        <div className="steps">
          {steps.map((step, i) => (
            <div
              key={step._key}
              className="step"
              // The closing step is emphasised — it is the payoff the others build to.
              data-last={i === steps.length - 1}
            >
              <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
              {t(step.title, locale) && <h3>{t(step.title, locale)}</h3>}
              {t(step.body, locale) && <p>{t(step.body, locale)}</p>}
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
