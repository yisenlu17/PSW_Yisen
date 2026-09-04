import Image from 'next/image'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/react'

import { urlFor, imageSize } from '@/sanity/image'
import { PortableBody } from '@/components/PortableBody'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import {
  statusLabel,
  roleLabel,
  isShipped,
  isInProgress,
  formatYears,
  projectTitle,
  handleLines,
  type ProjectCardData,
  type SanityImage,
} from '@/lib/project'
import { roleCompany } from '@/lib/experience'
import { detailHref } from '@/lib/href'
import { morphName } from '@/lib/view-transition'
import { Morph, NAV_LATERAL } from '@/components/transitions'
import { DetailHeader, DetailBlock, DetailList, MetricRow, copy } from './DetailChrome'

export type ProjectDetailData = ProjectCardData & {
  _type: 'project'
  roleDetail?: LocaleString[] | null
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
  // `handles` comes in with the card fields — the "Also running" strip shows it too.
  relatedExperience?: {
    _id: string
    company?: string | null
    companyLocal?: string | null
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

  // The hats named on the document win over the closed list: "Product Owner ·
  // Product Design · AI-assisted Development" says what "Solo" was trying to.
  const roles = (project.roleDetail ?? []).map((r) => t(r, locale)).filter(Boolean)
  const roleFallback = roleLabel(project.role, locale)

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
  const handles = handleLines(project.handles, locale)
  // A project still being built has nowhere to send anyone, and the row of buttons
  // going missing reads as an oversight. Said once, in the place the button would
  // have been, it reads as the answer instead.
  const noDoorYet = links.length === 0 && handles.length === 0 && isInProgress(project.status)
  const gallery = (project.gallery ?? []).filter((g) => g?.asset)
  const related = project.relatedProjects ?? []
  const roleHref = detailHref('experience', project.relatedExperience?.slug, locale)

  return (
    <main className="detail">
      <DetailHeader
        eyebrow={t(project.category, locale)}
        title={projectTitle(project, locale)}
        meta={t(project.tagline, locale)}
        lede={t(project.summary, locale)}
        backHref={`/${locale}/projects`}
        backLabel={c.backToProjects}
        titleName={morphName('project', 'title', project.slug)}
        chips={
          <>
            {status && (
              <span className="detail-chip" data-shipped={isShipped(project.status)}>
                {status}
              </span>
            )}
            {years && <span className="detail-chip">{years}</span>}
            {roles.length > 0
              ? roles.map((item, i) => (
                  <span key={i} className="detail-chip detail-chip-role">
                    {item}
                  </span>
                ))
              : roleFallback && <span className="detail-chip">{roleFallback}</span>}
          </>
        }
      >
        {(links.length > 0 || handles.length > 0 || noDoorYet) && (
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
            {/* An account, not an address: a 抖音号 is searched for in the app, so it
                is set as text to copy rather than as a button that opens nothing. */}
            {handles.map((handle) => (
              <span key={handle} className="detail-handle">
                {handle}
              </span>
            ))}
            {noDoorYet && <span className="detail-handle">{c.notPublicYet}</span>}
          </div>
        )}
      </DetailHeader>

      {project.cover && (
        <div className="detail-cover">
          <div className="wrap">
            {/* Asked for by width alone, and given the screenshot's own height: the
                cover is the whole capture rather than a 16:9 slice of it. */}
            <Morph name={morphName('project', 'cover', project.slug)}>
              <Image
                src={urlFor(project.cover).width(1800).url()}
                alt={project.cover.alt ? stegaClean(project.cover.alt) : ''}
                {...imageSize(project.cover)}
                sizes="(max-width: 1220px) 100vw, 1160px"
                priority
              />
            </Morph>
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
                    {...imageSize(shot)}
                    sizes="(max-width: 800px) 100vw, 560px"
                  />
                  {t(shot.caption, locale) && <figcaption>{t(shot.caption, locale)}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        )}

        {roleHref && project.relatedExperience && (
          <div className="detail-block">
            <h2>{c.fromThisRole}</h2>
            <Link href={roleHref} className="detail-cross" transitionTypes={NAV_LATERAL}>
              <span className="detail-cross-name">{roleCompany(project.relatedExperience, locale)}</span>
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
  const href = detailHref('projects', project.slug, locale)
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

  return href ? (
    <Link href={href} className="detail-related-card" transitionTypes={NAV_LATERAL}>
      {inner}
    </Link>
  ) : (
    <div className="detail-related-card">{inner}</div>
  )
}
