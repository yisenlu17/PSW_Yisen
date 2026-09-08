import Image from 'next/image'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { urlFor } from '@/sanity/image'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import { localizeHref } from '@/lib/href'
import type { SectionSettings } from '@/components/Section'
import type { SiteSettings } from '@/lib/site'
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
  // Left empty, the profile image from Global settings stands in.
  portrait?: (Parameters<typeof urlFor>[0] & { alt?: string | null }) | null
  portraitBadge?: LocaleString
  rotateHeadlineWord?: boolean | null
  settings?: SectionSettings | null
}

export function Hero({
  data,
  locale,
  site,
}: {
  data: HeroSectionData
  locale: Locale
  site: SiteSettings | null
}) {
  const words = (data.rotatingWords ?? []).map((w) => t(w, locale)).filter(Boolean)
  // Falling back to Global settings means turning the portrait on is one switch here
  // rather than a switch and a second upload of a photo the site already has.
  const portrait = data.portrait?.asset ? data.portrait : (site?.profileImage ?? null)
  const showPortrait = data.showPortrait !== false && Boolean(portrait?.asset)
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
                  const href = localizeHref(cta.href, locale) ?? '#'
                  if (!label) return null

                  const className = `btn ${stegaClean(cta.style ?? 'gold') === 'ghost' ? 'btn-ghost' : 'btn-gold'}`

                  /**
                   * `<Link>` for our own pages, a plain anchor for anything else.
                   *
                   * These were all plain anchors, which cost a full reload on the two
                   * most-clicked links on the site — and, once the site was also
                   * served from `/PSW_Yisen`, sent people to the wrong place entirely:
                   * `basePath` is applied by the router, and an `href` written by hand
                   * never passes through it. `localizeHref` leaves a scheme alone, so
                   * that is the test for which of the two this is.
                   */
                  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
                    return (
                      <a
                        key={cta._key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        {label}
                      </a>
                    )
                  }

                  return (
                    <Link key={cta._key} href={href} className={className}>
                      {label}
                    </Link>
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
                  src={urlFor(portrait!).width(840).height(1050).fit('crop').url()}
                  alt={portrait?.alt ? stegaClean(portrait.alt) : ''}
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
