import Link from 'next/link'
import Image from 'next/image'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { cropFor, urlFor } from '@/sanity/image'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import { localizeHref } from '@/lib/href'
import { NAV_LATERAL } from '@/components/transitions'

type Tile = {
  _key: string
  size?: string | null
  tone?: string | null
  kicker?: LocaleString
  title?: LocaleString
  body?: LocaleText
  stat?: string | null
  image?: (Parameters<typeof urlFor>[0] & { alt?: string | null }) | null
  href?: string | null
}

export type BentoGridSectionData = {
  _key: string
  _type: 'bentoGridSection'
  eyebrow?: LocaleString
  title?: LocaleString
  lede?: LocaleText
  tiles?: Tile[] | null
  settings?: SectionSettings | null
}

const SIZES = ['sm', 'wide', 'tall', 'lg'] as const
const TONES = ['paper', 'cream', 'navy', 'gold'] as const

/**
 * Roughly the shape each tile ends up on a wide screen — a 1×1 is a little wider
 * than tall, a wide is a band, a large is close to 3:2.
 *
 * Asked for at its own shape, a photograph is cropped by the image service with the
 * hotspot honoured, rather than by `object-fit` from the middle. It matters most on
 * the band: a face sits high in a group shot, and a centre crop of a 3:1 slot takes
 * the shirts instead.
 */
const TILE_SHAPE: Record<(typeof SIZES)[number], [number, number]> = {
  sm: [900, 620],
  wide: [1200, 400],
  tall: [700, 1000],
  lg: [1200, 840],
}

export function BentoGrid({ data, locale }: { data: BentoGridSectionData; locale: Locale }) {
  const tiles = data.tiles ?? []
  if (tiles.length === 0) return null

  return (
    <Section settings={data.settings}>
      {(t(data.eyebrow, locale) || t(data.title, locale)) && (
        <div className="section-head">
          {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
          {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
          {t(data.lede, locale) && <p className="lede">{t(data.lede, locale)}</p>}
        </div>
      )}

      <div className="bento">
        {tiles.map((tile) => {
          const size = one(tile.size, SIZES, 'sm')
          const tone = one(tile.tone, TONES, 'paper')
          const href = localizeHref(tile.href, locale)

          const [shotWidth, shotHeight] = TILE_SHAPE[size]

          const inner = (
            <>
              {tile.image && (
                <Image
                  className="bento-image"
                  src={cropFor(tile.image, shotWidth, shotHeight).url()}
                  alt={tile.image.alt ? stegaClean(tile.image.alt) : ''}
                  width={shotWidth}
                  height={shotHeight}
                  sizes="(max-width: 1100px) 100vw, 50vw"
                />
              )}
              <div className="bento-content">
                {t(tile.kicker, locale) && <span className="bento-kicker">{t(tile.kicker, locale)}</span>}
                {tile.stat && <span className="bento-stat">{stegaClean(tile.stat)}</span>}
                {t(tile.title, locale) && <h3>{t(tile.title, locale)}</h3>}
                {t(tile.body, locale) && <p>{t(tile.body, locale)}</p>}
              </div>
            </>
          )

          const className = 'bento-tile'
          const attrs = { 'data-size': size, 'data-tone': tone, 'data-has-image': Boolean(tile.image) }

          if (!href) {
            return (
              <div key={tile._key} className={className} {...attrs}>
                {inner}
              </div>
            )
          }

          const external = /^https?:/.test(href)
          return external ? (
            <a
              key={tile._key}
              className={className}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...attrs}
            >
              {inner}
            </a>
          ) : (
            <Link
              key={tile._key}
              className={className}
              href={href}
              transitionTypes={NAV_LATERAL}
              {...attrs}
            >
              {inner}
            </Link>
          )
        })}
      </div>
    </Section>
  )
}

function one<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const clean = typeof value === 'string' ? (stegaClean(value) as T) : undefined
  return clean && allowed.includes(clean) ? clean : fallback
}
