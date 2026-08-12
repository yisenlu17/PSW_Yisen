import Image from 'next/image'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { urlFor } from '@/sanity/image'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import { statusLabel, isShipped, projectTitle, type ProjectCardData } from '@/lib/project'

export type ProjectsSectionData = {
  _key: string
  _type: 'projectsSection'
  eyebrow?: LocaleString
  title?: LocaleString
  lede?: LocaleText
  limit?: number | null
  compact?: boolean | null
  alsoLabel?: LocaleString
  linkToDetail?: boolean | null
  projects?: ProjectCardData[] | null
  settings?: SectionSettings | null
}

/**
 * The section an interviewer scrolls to first.
 *
 * Featured projects alternate their image left and right down the page, which is the
 * prototype's layout and the reason the cards read as a sequence rather than a grid
 * of equals. Everything not featured drops into the "Also running" strip — the
 * accounts and the student venture belong on the page, but not at the same size as
 * the three things that shipped.
 */
export function ProjectsSection({
  data,
  locale,
}: {
  data: ProjectsSectionData
  locale: Locale
}) {
  const all = data.projects ?? []
  const linked = data.linkToDetail !== false

  // As in the Experience section, a set with nothing ticked renders as all cards
  // rather than as an empty section with an "Also running" list under it.
  const anyFeatured = all.some((p) => p.featured)
  const cards = anyFeatured ? all.filter((p) => p.featured) : all
  const also = anyFeatured ? all.filter((p) => !p.featured) : []

  const limit = data.limit ?? undefined
  const featured = limit ? cards.slice(0, limit) : cards
  const alsoLabelText = t(data.alsoLabel, locale)

  // Compact drops the full-bleed alternating cards for a row of one-liners, and with
  // them the "Also running" strip. It is what a homepage wants: enough to prove the
  // work exists, and a link to the page that actually shows it.
  const compact = data.compact === true

  return (
    <Section settings={data.settings}>
      <div className="section-head">
        {t(data.eyebrow, locale) && <p className="eyebrow">{t(data.eyebrow, locale)}</p>}
        {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
        {t(data.lede, locale) && <p className="lede">{t(data.lede, locale)}</p>}
      </div>

      {featured.length > 0 &&
        (compact ? (
          <div className="proj-compact-grid">
            {featured.map((project) => (
              <CompactProject
                key={project._id}
                project={project}
                locale={locale}
                linked={linked}
              />
            ))}
          </div>
        ) : (
          <div className="proj-list">
            {featured.map((project, i) => (
              <ProjectCard
                key={project._id}
                project={project}
                locale={locale}
                linked={linked}
                flipped={i % 2 === 1}
              />
            ))}
          </div>
        ))}

      {!compact && also.length > 0 && alsoLabelText && (
        <div className="proj-also">
          <p className="proj-also-label">{alsoLabelText}</p>
          <div className="proj-also-grid">
            {also.map((project) => (
              <AlsoRunning key={project._id} project={project} locale={locale} linked={linked} />
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}

function ProjectCard({
  project,
  locale,
  linked,
  flipped,
}: {
  project: ProjectCardData
  locale: Locale
  linked: boolean
  flipped: boolean
}) {
  const slug = project.slug ? stegaClean(project.slug) : null
  const href = linked && slug ? `/projects/${slug}` : null
  const status = statusLabel(project.status, locale)
  const tags = (project.tags ?? []).map((tag) => t(tag, locale)).filter(Boolean)

  return (
    <article className="proj-card" data-flipped={flipped}>
      <div className="proj-media">
        {project.cover ? (
          <Image
            src={urlFor(project.cover).width(1120).height(700).url()}
            alt={project.cover.alt ? stegaClean(project.cover.alt) : ''}
            width={560}
            height={350}
            sizes="(max-width: 900px) 100vw, 46vw"
          />
        ) : (
          // A card with no image keeps its frame rather than collapsing, so a
          // half-filled project still sits in the rhythm of the ones around it.
          <div className="proj-media-empty" aria-hidden />
        )}
      </div>

      <div className="proj-body">
        <div className="proj-kickers">
          {t(project.category, locale) && (
            <span className="proj-kicker">{t(project.category, locale)}</span>
          )}
          {status && (
            <span className="proj-status" data-shipped={isShipped(project.status)}>
              {status}
            </span>
          )}
        </div>

        <h3>
          {href ? (
            <Link href={href}>{projectTitle(project, locale)}</Link>
          ) : (
            projectTitle(project, locale)
          )}
        </h3>

        {t(project.tagline, locale) && (
          <p className="proj-tagline">{t(project.tagline, locale)}</p>
        )}
        {t(project.summary, locale) && <p className="proj-summary">{t(project.summary, locale)}</p>}

        {(tags.length > 0 || t(project.highlight, locale)) && (
          <div className="proj-tags">
            {tags.map((tag, i) => (
              <span key={i} className="proj-tag">
                {tag}
              </span>
            ))}
            {t(project.highlight, locale) && (
              <span className="proj-tag proj-tag-accent">{t(project.highlight, locale)}</span>
            )}
          </div>
        )}

        {href && (
          <Link href={href} className="proj-more">
            {locale === 'zh' ? '看完整项目' : 'Read the full project'}
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </article>
  )
}

/**
 * The homepage shape: name, what kind of thing it is, one line, and a link over the
 * whole tile. No image, no tags, no status chip — those are the project page's, and
 * repeating them here is what made the homepage long enough to need this in the first
 * place.
 */
function CompactProject({
  project,
  locale,
  linked,
}: {
  project: ProjectCardData
  locale: Locale
  linked: boolean
}) {
  const slug = project.slug ? stegaClean(project.slug) : null
  const href = linked && slug ? `/projects/${slug}` : null
  const body = t(project.tagline, locale) || t(project.summary, locale)

  return (
    <article className="proj-compact-item">
      {t(project.category, locale) && (
        <span className="proj-kicker">{t(project.category, locale)}</span>
      )}
      <h3>
        {href ? (
          <Link href={href} className="proj-compact-stretch">
            {projectTitle(project, locale)}
          </Link>
        ) : (
          projectTitle(project, locale)
        )}
      </h3>
      {body && <p>{body}</p>}
    </article>
  )
}

function AlsoRunning({
  project,
  locale,
  linked,
}: {
  project: ProjectCardData
  locale: Locale
  linked: boolean
}) {
  const slug = project.slug ? stegaClean(project.slug) : null
  const href = linked && slug ? `/projects/${slug}` : null
  const body = t(project.summary, locale) || t(project.tagline, locale)

  return (
    <div className="proj-also-item">
      <h4>
        {href ? (
          <Link href={href}>{projectTitle(project, locale)}</Link>
        ) : (
          projectTitle(project, locale)
        )}
      </h4>
      {body && <p>{body}</p>}
    </div>
  )
}
