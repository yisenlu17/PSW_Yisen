import type { CSSProperties, ReactNode } from 'react'
import Image from 'next/image'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { cropFor, imageSize, urlFor } from '@/sanity/image'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'

type Photo = Parameters<typeof urlFor>[0] & {
  _key: string
  alt?: string | null
  caption?: LocaleString
}

export type PhotoGallerySectionData = {
  _key: string
  _type: 'photoGallerySection'
  eyebrow?: LocaleString
  title?: LocaleString
  lede?: LocaleText
  photos?: Photo[] | null
  variant?: string | null
  settings?: SectionSettings | null
}

export function PhotoGallery({
  data,
  locale,
  index,
}: {
  data: PhotoGallerySectionData
  locale: Locale
  index?: number
}) {
  const photos = data.photos ?? []
  if (photos.length === 0) return null

  const variant = stegaClean(data.variant ?? 'grid')
  // The scroller is a track wider than the screen, so it needs something to be
  // clipped by. Every other variant lays out inside the reading column and would
  // only be given a redundant wrapper.
  const scroller = variant === 'scroller'

  return (
    <Section settings={data.settings} index={index}>
      {(t(data.eyebrow, locale) || t(data.title, locale) || t(data.lede, locale)) && (
        <div className="section-head">
          {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
          {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
          {t(data.lede, locale) && <p className="lede">{t(data.lede, locale)}</p>}
        </div>
      )}

      <Rail on={scroller}>
        <div className="gallery" data-variant={variant}>
          {photos.map((photo, i) => {
            const caption = t(photo.caption, locale)
            // Masonry and the scroller keep the picture's own proportions; the grid
            // and the filmstrip crop to a fixed shape so their rows line up. Where a
            // crop does happen it is done by the image service rather than by
            // `object-fit`: the hotspot set in the studio is honoured, and the browser
            // never downloads the half of a photograph it is about to hide.
            //
            // The scroller belongs in the first group because it has no rows to line
            // up — it is one band of photographs at a shared height. Cropping them all
            // to 4:3 took a quarter of the width off every 16:9 frame and nearly half
            // the height off the one portrait, which is most of a photograph removed
            // to make it match photographs it was never going to match.
            const natural = variant === 'masonry' || scroller
            const size = natural
              ? imageSize(photo, { width: 800, height: 600 })
              : { width: 800, height: 600 }
            const img = natural ? urlFor(photo).width(1000).url() : cropFor(photo, 800, 600).url()

            return (
              <figure
                key={photo._key}
                className="gallery-item"
                // The strip is sized by height, so each frame's width is its own
                // aspect ratio — which is what lets a landscape photograph be
                // landscape, and the portrait one sit narrow beside it, both whole.
                style={
                  scroller
                    ? ({ '--ar': (size.width / size.height).toFixed(4) } as CSSProperties)
                    : undefined
                }
              >
                <Image
                  src={img}
                  alt={photo.alt ? stegaClean(photo.alt) : ''}
                  {...size}
                  sizes={
                    scroller ? '(max-width: 700px) 70vw, 520px' : '(max-width: 700px) 100vw, 33vw'
                  }
                  style={variant === 'masonry' ? { height: 'auto' } : undefined}
                  // The first couple are likely above the fold on a gallery page.
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
                {caption && <figcaption>{caption}</figcaption>}
              </figure>
            )
          })}
        </div>
      </Rail>
    </Section>
  )
}

/** Edge-to-edge clipping for the one variant that runs wider than the page. */
function Rail({ on, children }: { on: boolean; children: ReactNode }) {
  return on ? <div className="gallery-rail">{children}</div> : <>{children}</>
}
