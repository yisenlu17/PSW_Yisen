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
}: {
  data: PhotoGallerySectionData
  locale: Locale
}) {
  const photos = data.photos ?? []
  if (photos.length === 0) return null

  const variant = stegaClean(data.variant ?? 'grid')

  return (
    <Section settings={data.settings}>
      {(t(data.eyebrow, locale) || t(data.title, locale) || t(data.lede, locale)) && (
        <div className="section-head">
          {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
          {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
          {t(data.lede, locale) && <p className="lede">{t(data.lede, locale)}</p>}
        </div>
      )}

      <div className="gallery" data-variant={variant}>
        {photos.map((photo, i) => {
          const caption = t(photo.caption, locale)
          // Masonry keeps natural proportions, so the picture's own dimensions are
          // what reserve its space — a column of photographs that all settle a
          // different amount as they load is the thing masonry is worst at. The other
          // two crop to a fixed shape so rows line up, done by the image service
          // rather than by CSS: the hotspot is honoured, and the browser never
          // downloads pixels it is about to hide.
          const masonry = variant === 'masonry'
          const size = masonry ? imageSize(photo, { width: 800, height: 600 }) : { width: 800, height: 600 }
          const img = masonry ? urlFor(photo).width(800).url() : cropFor(photo, 800, 600).url()

          return (
            <figure key={photo._key} className="gallery-item">
              <Image
                src={img}
                alt={photo.alt ? stegaClean(photo.alt) : ''}
                {...size}
                sizes="(max-width: 700px) 100vw, 33vw"
                style={masonry ? { height: 'auto' } : undefined}
                // The first couple are likely above the fold on a gallery page.
                loading={i < 2 ? 'eager' : 'lazy'}
              />
              {caption && <figcaption>{caption}</figcaption>}
            </figure>
          )
        })}
      </div>
    </Section>
  )
}
