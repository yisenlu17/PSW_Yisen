import Image from 'next/image'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/react'

import { urlFor } from '@/sanity/image'
import { PortableBody } from '@/components/PortableBody'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import {
  statusLabel,
  roleLabel,
  isShipped,
  formatYears,
  projectTitle,
  type ProjectCardData,
  type SanityImage,
} from '@/lib/project'
import { DetailHeader, DetailBlock, DetailList, MetricRow, copy } from './DetailChrome'

export type ProjectDetailData = ProjectCardData & {
  _type: 'project'
  problem?: LocaleText
  approach?: LocaleText
  outcome?: LocaleText
  body?: PortableTextBlock[] | null
  bodyZh?: PortableTextBlock[] | null
  metrics?: Array<{ _key: string; value?: string | null; label?: LocaleString; source?: LocaleString }> | null
  features?: LocaleString[] | null
  learnings?: LocaleString[] | null
  stack?: string[] | null
  gallery?: SanityImage[] | null
  links?: Array<{ _key: string; kind?: string | null; label?: LocaleString; url?: string | null }> | null
  relatedExperience?: {
    _id: string
    company?: string | null
    slug?: string | null
    role?: LocaleString
    category?: LocaleString
  } | null
  relatedProjects?: ProjectCardData[] | null
  seoTitle?: LocaleString
  seoDescription?: LocaleText
}

/**
 * The case study.
 *
 * `body` wins when it exists and the three short fields render otherwise, so a
 * project can be published with three paragraphs on the day it ships and grow into a
 * full write-up later without anything being moved between fields.
 */
export function ProjectDetail({ project, locale }: { project: ProjectDetailData; locale: Locale }) {
  const c = copy(locale)
  const status = statusLabel(project.status, locale)
  const years = formatYears(project.startDate, project.endDate, locale)
  const role = roleLabel(project.role, locale)

  const hasBody = Boolean((locale === 'zh' && project.bodyZh?.length) || project.body?.length)
  const metrics = (project.metrics ?? []).map((m) => ({
    _key: m._key,
    value: m.value,
    label: t(m.label, locale),
    source: t(m.source, locale),
  }))
  const features = (project.features ?? []).map((f) => t(f, locale)).filter(Boolean)
  const learnings = (project.learnings ?? []).map((l) => t(l, locale)).filter(Boolean)
  const links = (project.links ?? []).filter((l) => l.url && t(l.label, locale))
  const gallery = (project.gallery ?? []).filter((g) => g?.asset)
  const related = project.relatedProjects ?? []

  return (
    <main className="detail">
      <DetailHeader
        eyebrow={t(project.category, locale)}
        title={projectTitle(project, locale)}
        meta={t(project.tagline, locale)}
        lede={t(project.summary, locale)}
        backHref="/projects"
        backLabel={c.backToProjects}
        chips={
          <>
            {status && (
              <span className="detail-chip" data-shipped={isShipped(project.status)}>
                {status}
              </span>
            )}
            {years && <span className="detail-chip">{years}</span>}
            {role && <span className="detail-chip">{role}</span>}
          </>
        }
      >
        {links.length > 0 && (
          <div className="detail-links">
            {links.map((link) => (
              <a
                key={link._key}
                href={stegaClean(link.url!)}
                className="btn btn-ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(link.label, locale)}
              </a>
            ))}
          </div>
        )}
      </DetailHeader>

      {project.cover && (
        <div className="detail-cover">
          <div className="wrap">
            <Image
              src={urlFor(project.cover).width(1800).height(1013).url()}
              alt={project.cover.alt ? stegaClean(project.cover.alt) : ''}
              width={1200}
              height={675}
              sizes="(max-width: 1220px) 100vw, 1160px"
              priority
            />
          </div>
        </div>
      )}

      <div className="wrap detail-body">
        <MetricRow metrics={metrics} />

        {hasBody ? (
          <PortableBody value={project.body} valueZh={project.bodyZh} locale={locale} />
        ) : (
          <>
            <DetailBlock label={c.problem} body={t(project.problem, locale)} />
            <DetailBlock label={c.approach} body={t(project.approach, locale)} />
            <DetailBlock label={c.outcome} body={t(project.outcome, locale)} />
          </>
        )}

        <DetailList label={c.features} items={features} />
        <DetailList label={c.learnings} items={learnings} />

        {(project.stack?.length ?? 0) > 0 && (
          <div className="detail-block">
            <h2>{c.builtWith}</h2>
            <div className="detail-tags">
              {project.stack!.map((item, i) => (
                <span key={i} className="detail-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {gallery.length > 0 && (
          <div className="detail-block">
            <h2>{c.gallery}</h2>
            <div className="detail-gallery">
              {gallery.map((shot, i) => (
                <figure key={i}>
                  <Image
                    src={urlFor(shot).width(1200).url()}
                    alt={shot.alt ? stegaClean(shot.alt) : ''}
                    width={600}
                    height={400}
                    sizes="(max-width: 800px) 100vw, 560px"
                  />
                  {t(shot.caption, locale) && <figcaption>{t(shot.caption, locale)}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        )}

        {project.relatedExperience?.slug && (
          <div className="detail-block">
            <h2>{c.fromThisRole}</h2>
            <Link
              href={`/experience/${stegaClean(project.relatedExperience.slug)}`}
              className="detail-cross"
            >
              <span className="detail-cross-name">{project.relatedExperience.company}</span>
              {t(project.relatedExperience.role, locale) && (
                <span className="detail-cross-meta">
                  {t(project.relatedExperience.role, locale)}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="detail-related">
          <div className="wrap">
            <h2>{c.related}</h2>
            <div className="detail-related-grid">
              {related.map((item) => (
                <RelatedProject key={item._id} project={item} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export function RelatedProject({
  project,
  locale,
}: {
  project: ProjectCardData
  locale: Locale
}) {
  const slug = project.slug ? stegaClean(project.slug) : null
  const body = t(project.summary, locale) || t(project.tagline, locale)
  const status = statusLabel(project.status, locale)

  const inner = (
    <>
      {status && (
        <span className="detail-chip" data-shipped={isShipped(project.status)}>
          {status}
        </span>
      )}
      <h3>{projectTitle(project, locale)}</h3>
      {body && <p>{body}</p>}
    </>
  )

  return slug ? (
    <Link href={`/projects/${slug}`} className="detail-related-card">
      {inner}
    </Link>
  ) : (
    <div className="detail-related-card">{inner}</div>
  )
}
