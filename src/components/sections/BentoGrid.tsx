import Link from 'next/link'
import Image from 'next/image'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { urlFor } from '@/sanity/image'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'

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
          const href = tile.href ? stegaClean(tile.href) : null

          const inner = (
            <>
              {tile.image && (
                <Image
                  className="bento-image"
                  src={urlFor(tile.image).width(900).height(900).url()}
                  alt={tile.image.alt ? stegaClean(tile.image.alt) : ''}
                  width={450}
                  height={450}
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
            <Link key={tile._key} className={className} href={href} {...attrs}>
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
