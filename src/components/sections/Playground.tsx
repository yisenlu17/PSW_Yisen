import Image from 'next/image'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { urlFor } from '@/sanity/image'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import type { SanityImage } from '@/lib/project'

export type PlaygroundItem = {
  _id: string
  kind?: 'sport' | 'interest' | null
  name?: string | null
  nameLocal?: string | null
  note?: LocaleText
  prominent?: boolean | null
  order?: number | null
}

export type PlaygroundSectionData = {
  _key: string
  _type: 'playgroundSection'
  eyebrow?: LocaleString
  title?: LocaleString
  lede?: LocaleText
  statement?: { label?: LocaleString; body?: LocaleText } | null
  interestsLabel?: LocaleString
  note?: LocaleText
  primaryImage?: SanityImage | null
  secondaryImage?: SanityImage | null
  items?: PlaygroundItem[] | null
  settings?: SectionSettings | null
}

/** How many sports get a tile of their own before the rest are stacked together. */
const PROMINENT_TILES = 3

/**
 * A tile shows both names stacked — that pairing is part of the design. A pill has
 * room for one, so it takes whichever matches the language being read.
 */
function pillLabel(item: PlaygroundItem, locale: Locale): string {
  if (locale === 'zh' && item.nameLocal && stegaClean(item.nameLocal).trim()) return item.nameLocal
  return item.name ?? ''
}

/**
 * Life outside work, as a three-column mosaic.
 *
 * The grid is fixed and the content is not: prominent sports take a tile each, the
 * remaining sports share the fourth tile as a stacked list, and interests become
 * pills. That keeps the mosaic to four cells whether there are four sports or
 * fourteen — the prototype's version broke the moment a seventh was added, because
 * the six tiles were written out by hand.
 */
export function Playground({ data, locale }: { data: PlaygroundSectionData; locale: Locale }) {
  const items = data.items ?? []
  const sports = items.filter((i) => stegaClean(i.kind ?? 'sport') === 'sport')
  const interests = items.filter((i) => stegaClean(i.kind ?? '') === 'interest')

  // Falling back to "the first few" when nothing is ticked keeps the grid populated
  // rather than dropping every sport into the stacked tile.
  const explicit = sports.filter((s) => s.prominent)
  const tiled = (explicit.length > 0 ? explicit : sports).slice(0, PROMINENT_TILES)
  const stacked = sports.filter((s) => !tiled.includes(s))

  const statementLabel = t(data.statement?.label, locale)
  const statementBody = t(data.statement?.body, locale)
  const hasStatement = Boolean(statementLabel || statementBody)
  const interestsLabelText = t(data.interestsLabel, locale)
  const noteText = t(data.note, locale)
  const hasInterests = interests.length > 0 || Boolean(noteText)

  const hasMosaic = tiled.length > 0 || stacked.length > 0
  const hasSideColumn = Boolean(data.primaryImage) || hasStatement
  const hasLastColumn = hasInterests || Boolean(data.secondaryImage)

  return (
    <Section settings={data.settings}>
      <div className="section-head play-head">
        {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
        {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
        {t(data.lede, locale) && <p className="lede">{t(data.lede, locale)}</p>}
      </div>

      <div className="play-grid">
        {hasMosaic && (
          <div className="play-tiles">
            {tiled.map((sport) => (
              <div key={sport._id} className="play-tile">
                <span className="play-tile-name">{sport.name}</span>
                {sport.nameLocal && <span className="play-tile-local">{sport.nameLocal}</span>}
                {t(sport.note, locale) && <p>{t(sport.note, locale)}</p>}
              </div>
            ))}

            {stacked.length > 0 && (
              <div className="play-tile play-tile-stack">
                {stacked.map((sport) => (
                  <div key={sport._id}>
                    <span className="play-stack-name">{sport.name}</span>
                    {sport.nameLocal && <span className="play-stack-local">{sport.nameLocal}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {hasSideColumn && (
          <div className="play-col">
            {data.primaryImage && (
              <div className="play-media play-media-43">
                <Image
                  src={urlFor(data.primaryImage).width(900).height(675).url()}
                  alt={data.primaryImage.alt ? stegaClean(data.primaryImage.alt) : ''}
                  width={450}
                  height={338}
                  sizes="(max-width: 900px) 100vw, 30vw"
                />
              </div>
            )}
            {hasStatement && (
              <div className="play-panel play-panel-dark">
                {statementLabel && <p className="play-panel-label">{statementLabel}</p>}
                {statementBody && <p className="play-panel-body">{statementBody}</p>}
              </div>
            )}
          </div>
        )}

        {hasLastColumn && (
          <div className="play-col">
            {hasInterests && (
              <div className="play-panel">
                {interestsLabelText && <p className="play-panel-label">{interestsLabelText}</p>}
                {interests.length > 0 && (
                  <div className="play-pills">
                    {interests.map((interest) => (
                      <span key={interest._id} className="play-pill">
                        {pillLabel(interest, locale)}
                      </span>
                    ))}
                  </div>
                )}
                {noteText && <p className="play-note">{noteText}</p>}
              </div>
            )}
            {data.secondaryImage && (
              <div className="play-media play-media-square">
                <Image
                  src={urlFor(data.secondaryImage).width(800).height(800).url()}
                  alt={data.secondaryImage.alt ? stegaClean(data.secondaryImage.alt) : ''}
                  width={400}
                  height={400}
                  sizes="(max-width: 900px) 100vw, 30vw"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  )
}
