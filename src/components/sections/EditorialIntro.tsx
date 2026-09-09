import Image from 'next/image'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import { urlFor } from '@/sanity/image'
import type { SiteSettings } from '@/lib/site'

export type EditorialIntroSectionData = {
  _key: string
  _type: 'editorialIntroSection'
  eyebrow?: LocaleString
  title?: LocaleString
  lede?: LocaleText
  note?: LocaleText
  showPortrait?: boolean | null
  // A per-section override; left empty, the profile image from Global settings is used.
  portrait?: (Parameters<typeof urlFor>[0] & { alt?: string | null }) | null
  portraitCaption?: LocaleString
  steps?: Array<{ _key: string; title?: LocaleString; body?: LocaleText }> | null
  settings?: SectionSettings | null
}

export function EditorialIntro({
  data,
  locale,
  site,
  index,
}: {
  data: EditorialIntroSectionData
  locale: Locale
  site: SiteSettings | null
  index?: number
}) {
  const steps = data.steps ?? []

  // The photo is maintained once, in Global settings, so replacing it there replaces
  // it in the masthead and here at the same time. A section-level image overrides it,
  // for the page that wants a different picture rather than a second copy of this one.
  const override = Boolean(data.portrait?.asset)
  const portrait = override ? data.portrait : (site?.profileImage ?? null)
  const showPortrait = data.showPortrait !== false && Boolean(portrait?.asset)
  const caption = t(data.portraitCaption, locale)

  // Unauthored, the profile photo describes itself: it is the person the page is
  // about. An override is some other picture, so silence beats guessing at it.
  const alt = portrait?.alt
    ? stegaClean(portrait.alt)
    : override
      ? ''
      : stegaClean(site?.name ?? '')

  return (
    <Section settings={data.settings} index={index}>
      <div className="intro-top" data-has-portrait={showPortrait}>
        <div className="section-head intro-head">
          {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
          {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
          {t(data.lede, locale) && <p className="lede">{t(data.lede, locale)}</p>}
          {t(data.note, locale) && <p className="intro-note">{t(data.note, locale)}</p>}
        </div>

        {showPortrait && (
          <figure className="intro-portrait">
            <div className="intro-portrait-frame" aria-hidden />
            <div className="intro-portrait-media">
              <Image
                src={urlFor(portrait!).width(720).height(900).fit('crop').url()}
                alt={alt}
                width={360}
                height={450}
              />
            </div>
            {caption && <figcaption>{caption}</figcaption>}
          </figure>
        )}
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
