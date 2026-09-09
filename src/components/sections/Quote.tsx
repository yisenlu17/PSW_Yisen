import Image from 'next/image'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { urlFor } from '@/sanity/image'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'

export type QuoteSectionData = {
  _key: string
  _type: 'quoteSection'
  quote?: LocaleText
  attribution?: LocaleString
  context?: LocaleString
  portrait?: (Parameters<typeof urlFor>[0] & { alt?: string | null }) | null
  variant?: string | null
  settings?: SectionSettings | null
}

export function Quote({ data, locale, index }: { data: QuoteSectionData; locale: Locale; index?: number }) {
  const quote = t(data.quote, locale)
  if (!quote) return null

  const variant = stegaClean(data.variant ?? 'display')
  // "Beside a portrait" needs a portrait; without one it would render as a lopsided
  // grid with an empty column, so it falls back to the centred treatment.
  const layout = variant === 'portrait' && !data.portrait ? 'display' : variant

  const attribution = t(data.attribution, locale)
  const context = t(data.context, locale)

  return (
    <Section settings={data.settings} index={index} className="quote-section">
      <figure className="quote" data-variant={layout}>
        {layout === 'portrait' && data.portrait && (
          <div className="quote-portrait">
            <Image
              src={urlFor(data.portrait).width(320).height(320).url()}
              alt={data.portrait.alt ? stegaClean(data.portrait.alt) : ''}
              width={160}
              height={160}
            />
          </div>
        )}

        <div className="quote-body">
          <blockquote>{quote}</blockquote>
          {(attribution || context) && (
            <figcaption>
              {attribution && <span className="quote-by">{attribution}</span>}
              {context && <span className="quote-context">{context}</span>}
            </figcaption>
          )}
        </div>
      </figure>
    </Section>
  )
}
