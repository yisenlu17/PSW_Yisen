import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { VideoPlayer } from '@/components/VideoPlayer'
import { urlFor } from '@/sanity/image'
import { resolveVideo, type VideoEmbedData } from '@/lib/video'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'

export type VideoFeatureSectionData = {
  _key: string
  _type: 'videoFeatureSection'
  eyebrow?: LocaleString
  title?: LocaleString
  body?: LocaleText
  video?: (VideoEmbedData & { poster?: Parameters<typeof urlFor>[0] | null }) | null
  variant?: string | null
  settings?: SectionSettings | null
}

export function VideoFeature({
  data,
  locale,
  index,
}: {
  data: VideoFeatureSectionData
  locale: Locale
  index?: number
}) {
  const resolved = resolveVideo(data.video)
  // An unresolvable link — a playlist URL, a typo — renders nothing rather than an
  // empty black box that looks like a broken player.
  if (!resolved) return null

  const variant = stegaClean(data.variant ?? 'full')
  const poster = data.video?.poster ? urlFor(data.video.poster).width(1600).url() : null
  const title = t(data.video?.title as LocaleString, locale) || t(data.title, locale)
  const caption = t(data.video?.caption as LocaleString, locale)

  return (
    <Section settings={data.settings} index={index}>
      <div className="video-feature" data-variant={variant}>
        <div className="video-copy">
          {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
          {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
          {t(data.body, locale) && <p className="lede">{t(data.body, locale)}</p>}
        </div>

        <figure className="video-wrap">
          <VideoPlayer video={resolved} poster={poster} title={title} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      </div>
    </Section>
  )
}
