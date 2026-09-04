import Image from 'next/image'
import { stegaClean } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/react'

import { urlFor, imageSize } from '@/sanity/image'
import { PortableBody } from '@/components/PortableBody'
import { t, formatDateRange, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import type { ProjectCardData, SanityImage } from '@/lib/project'
import { roleCompany, roleLocation } from '@/lib/experience'
import { DetailHeader, MetricRow, copy } from './DetailChrome'
import { RelatedProject } from './ProjectDetail'

/**
 * One piece of work: what it was, what it took, and — when there is one — a picture
 * of it. Skills are attached here rather than pooled at the bottom of the page, so a
 * reader sees which part of the role each one came out of.
 */
export type Contribution = {
  _key: string
  title?: LocaleString
  body?: LocaleText
  skills?: LocaleString[] | null
  image?: SanityImage | null
}

export type ExperienceDetailData = {
  _id: string
  _type: 'experience'
  company?: string | null
  companyLocal?: string | null
  slug?: string | null
  role?: LocaleString
  category?: LocaleString
  location?: string | null
  locationLocal?: string | null
  startDate?: string | null
  endDate?: string | null
  summary?: LocaleText
  secondary?: LocaleText
  highlight?: LocaleString
  contributions?: Contribution[] | null
  fullStory?: PortableTextBlock[] | null
  fullStoryZh?: PortableTextBlock[] | null
  metrics?: Array<{ _key: string; value?: string | null; label?: LocaleString }> | null
  images?: SanityImage[] | null
  documents?: Array<{ _key: string; url?: string | null; filename?: string | null }> | null
  projects?: ProjectCardData[] | null
}

/**
 * The role, at full length.
 *
 * This is where the work itself lives — the cards on /experience carry a paragraph
 * and a link, and everything longer than that comes out here: the contributions with
 * their skills and pictures, the write-up, the metrics, the gallery, the files.
 * Projects are not listed on the role; they point at it, and the query finds them by
 * reverse lookup, so linking a side project to a job is one edit in one document.
 */
export function ExperienceDetail({
  experience,
  locale,
}: {
  experience: ExperienceDetailData
  locale: Locale
}) {
  const c = copy(locale)
  const dates = formatDateRange(experience.startDate, experience.endDate, locale)

  const metrics = (experience.metrics ?? []).map((m) => ({
    _key: m._key,
    value: m.value,
    label: t(m.label, locale),
  }))
  const contributions = (experience.contributions ?? []).filter(
    (contribution) => t(contribution.title, locale) || t(contribution.body, locale)
  )
  const images = (experience.images ?? []).filter((i) => i?.asset)
  const documents = (experience.documents ?? []).filter((d) => d.url)
  const projects = experience.projects ?? []

  return (
    <main className="detail">
      <DetailHeader
        eyebrow={t(experience.category, locale)}
        title={roleCompany(experience, locale)}
        meta={[t(experience.role, locale), dates, roleLocation(experience, locale)]
          .filter(Boolean)
          .join(' · ')}
        lede={t(experience.summary, locale)}
        backHref={`/${locale}/experience`}
        backLabel={c.backToExperience}
        chips={
          t(experience.highlight, locale) ? (
            <span className="detail-chip" data-shipped>
              {t(experience.highlight, locale)}
            </span>
          ) : undefined
        }
      />

      <div className="wrap detail-body">
        <MetricRow metrics={metrics} />

        {t(experience.secondary, locale) && (
          <div className="detail-block">
            <p>{t(experience.secondary, locale)}</p>
          </div>
        )}

        <PortableBody value={experience.fullStory} valueZh={experience.fullStoryZh} locale={locale} />

        {contributions.length > 0 && (
          <div className="detail-block">
            <h2>{c.whatIDid}</h2>
            <ol className="contrib-list">
              {contributions.map((contribution) => (
                <li key={contribution._key} className="contrib">
                  {t(contribution.title, locale) && (
                    <h3 className="contrib-title">{t(contribution.title, locale)}</h3>
                  )}
                  {t(contribution.body, locale) && <p>{t(contribution.body, locale)}</p>}

                  {(contribution.skills ?? []).length > 0 && (
                    <div className="detail-tags contrib-tags">
                      {contribution.skills!.map((skill, i) => (
                        <span key={i} className="detail-tag">
                          {t(skill, locale)}
                        </span>
                      ))}
                    </div>
                  )}

                  {contribution.image?.asset && (
                    <figure className="contrib-figure">
                      <Image
                        src={urlFor(contribution.image).width(1200).url()}
                        alt={contribution.image.alt ? stegaClean(contribution.image.alt) : ''}
                        {...imageSize(contribution.image)}
                        sizes="(max-width: 800px) 100vw, 680px"
                      />
                    </figure>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {images.length > 0 && (
          <div className="detail-block">
            <h2>{c.gallery}</h2>
            <div className="detail-gallery">
              {images.map((image, i) => (
                <figure key={i}>
                  <Image
                    src={urlFor(image).width(1200).url()}
                    alt={image.alt ? stegaClean(image.alt) : ''}
                    {...imageSize(image)}
                    sizes="(max-width: 800px) 100vw, 560px"
                  />
                </figure>
              ))}
            </div>
          </div>
        )}

        {documents.length > 0 && (
          <div className="detail-block">
            <h2>{c.documents}</h2>
            <div className="detail-tags">
              {documents.map((doc) => (
                <a
                  key={doc._key}
                  href={stegaClean(doc.url!)}
                  className="detail-tag detail-tag-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {doc.filename ? stegaClean(doc.filename) : c.documents}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {projects.length > 0 && (
        <section className="detail-related">
          <div className="wrap">
            <h2>{c.cameOutOfThis}</h2>
            <div className="detail-related-grid">
              {projects.map((project) => (
                <RelatedProject key={project._id} project={project} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
