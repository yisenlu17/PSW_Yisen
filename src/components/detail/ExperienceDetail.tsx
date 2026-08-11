import Image from 'next/image'
import { stegaClean } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/react'

import { urlFor } from '@/sanity/image'
import { PortableBody } from '@/components/PortableBody'
import { t, formatDateRange, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import type { ProjectCardData, SanityImage } from '@/lib/project'
import { DetailHeader, DetailList, MetricRow, copy } from './DetailChrome'
import { RelatedProject } from './ProjectDetail'

export type ExperienceDetailData = {
  _id: string
  _type: 'experience'
  company?: string | null
  slug?: string | null
  role?: LocaleString
  category?: LocaleString
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  summary?: LocaleText
  secondary?: LocaleText
  highlight?: LocaleString
  skills?: string[] | null
  fullStory?: PortableTextBlock[] | null
  responsibilities?: LocaleString[] | null
  problemsSolved?: LocaleString[] | null
  metrics?: Array<{ _key: string; value?: string | null; label?: LocaleString }> | null
  images?: SanityImage[] | null
  documents?: Array<{ _key: string; url?: string | null; filename?: string | null }> | null
  projects?: ProjectCardData[] | null
}

/**
 * The role, at full length.
 *
 * Every field the Experience schema already had and nothing rendered — the full
 * story, responsibilities, problems solved, metrics, images and attachments — comes
 * out here. Projects are not listed on the role; they point at it, and the query
 * finds them by reverse lookup, so linking a side project to a job is one edit in
 * one document.
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
  const responsibilities = (experience.responsibilities ?? []).map((r) => t(r, locale)).filter(Boolean)
  const problems = (experience.problemsSolved ?? []).map((p) => t(p, locale)).filter(Boolean)
  const images = (experience.images ?? []).filter((i) => i?.asset)
  const documents = (experience.documents ?? []).filter((d) => d.url)
  const projects = experience.projects ?? []

  return (
    <main className="detail">
      <DetailHeader
        eyebrow={t(experience.category, locale)}
        title={experience.company ?? ''}
        meta={[t(experience.role, locale), dates, experience.location].filter(Boolean).join(' · ')}
        lede={t(experience.summary, locale)}
        backHref="/experience"
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

        <PortableBody value={experience.fullStory} locale={locale} />

        <DetailList label={c.responsibilities} items={responsibilities} />
        <DetailList label={c.problemsSolved} items={problems} />

        {(experience.skills?.length ?? 0) > 0 && (
          <div className="detail-block">
            <h2>{c.skills}</h2>
            <div className="detail-tags">
              {experience.skills!.map((skill, i) => (
                <span key={i} className="detail-tag">
                  {skill}
                </span>
              ))}
            </div>
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
                    width={600}
                    height={400}
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
