import Image from 'next/image'
import { stegaClean } from 'next-sanity'

import { urlFor } from '@/sanity/image'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import type { SectionSettings } from '@/components/Section'
import { RotatingWord } from './RotatingWord'

export type HeroSectionData = {
  _key: string
  _type: 'heroSection'
  eyebrow?: LocaleString
  headlineLine1?: LocaleString
  headlineLine2?: LocaleString
  rotatingWords?: LocaleString[] | null
  lede?: LocaleText
  ctas?: Array<{
    _key: string
    label?: LocaleString
    href?: string | null
    style?: 'gold' | 'ghost' | null
  }> | null
  metaItems?: LocaleString[] | null
  showPortrait?: boolean | null
  // Sanity image shape; `urlFor` needs the asset ref, `alt` is authored alongside it.
  portrait?: (Parameters<typeof urlFor>[0] & { alt?: string | null }) | null
  portraitBadge?: LocaleString
  rotateHeadlineWord?: boolean | null
  settings?: SectionSettings | null
}

export function Hero({ data, locale }: { data: HeroSectionData; locale: Locale }) {
  const words = (data.rotatingWords ?? []).map((w) => t(w, locale)).filter(Boolean)
  const showPortrait = data.showPortrait !== false && Boolean(data.portrait)
  const noMotion = stegaClean(data.settings?.animation ?? 'default') === 'none'

  return (
    <section className="hero" id={data.settings?.anchorId ? stegaClean(data.settings.anchorId) : undefined}>
      <div className="hero-glow" aria-hidden />

      <div className="wrap hero-wrap">
        <div className="hero-grid" data-has-portrait={showPortrait}>
          <div className="hero-copy">
            {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}

            <h1>
              {t(data.headlineLine1, locale)}
              {t(data.headlineLine2, locale) && (
                <>
                  <br />
                  {t(data.headlineLine2, locale)}{' '}
                </>
              )}
              {words.length > 0 && (
                <RotatingWord words={words} enabled={data.rotateHeadlineWord !== false && !noMotion} />
              )}
            </h1>

            {t(data.lede, locale) && <p className="lede hero-lede">{t(data.lede, locale)}</p>}

            {(data.ctas?.length ?? 0) > 0 && (
              <div className="cta-row">
                {data.ctas!.map((cta) => {
                  const label = t(cta.label, locale)
                  const href = cta.href ? stegaClean(cta.href) : '#'
                  if (!label) return null
                  return (
                    <a
                      key={cta._key}
                      href={href}
                      className={`btn ${stegaClean(cta.style ?? 'gold') === 'ghost' ? 'btn-ghost' : 'btn-gold'}`}
                    >
                      {label}
                    </a>
                  )
                })}
              </div>
            )}

            {(data.metaItems?.length ?? 0) > 0 && (
              <div className="hero-meta">
                {data.metaItems!.map((item, i) => {
                  const text = t(item, locale)
                  return text ? <span key={i}>{text}</span> : null
                })}
              </div>
            )}
          </div>

          {showPortrait && (
            <div className="hero-portrait">
              <div className="hero-portrait-frame" aria-hidden />
              <div className="hero-portrait-media">
                <Image
                  src={urlFor(data.portrait!).width(840).height(1050).url()}
                  alt={data.portrait?.alt ? stegaClean(data.portrait.alt) : ''}
                  width={420}
                  height={525}
                  priority
                />
              </div>
              {t(data.portraitBadge, locale) && (
                <div className="hero-portrait-badge">{t(data.portraitBadge, locale)}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
