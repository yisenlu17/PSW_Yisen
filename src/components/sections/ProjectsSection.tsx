import Image from 'next/image'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { urlFor, imageSize } from '@/sanity/image'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import { statusLabel, isShipped, projectTitle, handleLines, type ProjectCardData } from '@/lib/project'
import { detailHref } from '@/lib/href'
import { morphName } from '@/lib/view-transition'
import { Morph, NAV_FORWARD } from '@/components/transitions'

export type ProjectsSectionData = {
  _key: string
  _type: 'projectsSection'
  eyebrow?: LocaleString
  title?: LocaleString
  lede?: LocaleText
  limit?: number | null
  variant?: 'cards' | 'showcase' | null
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
  index,
}: {
  data: ProjectsSectionData
  locale: Locale
  index?: number
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

  // Showcase drops the card frame entirely: the cover becomes the object on the page
  // and the writing sits beside it, numbered. A bordered box around a screenshot is a
  // card; a screenshot at size with a number against it is a piece of work.
  const showcase = stegaClean(data.variant ?? 'cards') === 'showcase' && !compact

  return (
    <Section settings={data.settings} index={index}>
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
          <div className="proj-list" data-variant={showcase ? 'showcase' : undefined}>
            {featured.map((project, i) => (
              <ProjectCard
                key={project._id}
                project={project}
                locale={locale}
                linked={linked}
                flipped={i % 2 === 1}
                showcase={showcase}
                index={i + 1}
              />
            ))}
          </div>
        ))}

      {!compact && also.length > 0 && alsoLabelText && (
        <div className="proj-also">
          <p className="proj-also-label">{alsoLabelText}</p>
          <div className="proj-also-grid">
            {also.map((project) => (
              <AlsoRunning key={project._id} project={project} locale={locale} />
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
  showcase = false,
  index,
}: {
  project: ProjectCardData
  locale: Locale
  linked: boolean
  flipped: boolean
  showcase?: boolean
  index?: number
}) {
  const href = linked ? detailHref('projects', project.slug, locale) : null
  const status = statusLabel(project.status, locale)
  const tags = (project.tags ?? []).map((tag) => t(tag, locale)).filter(Boolean)

  return (
    <article className="proj-card" data-flipped={flipped} data-showcase={showcase || undefined}>
      {/* No picture, no column: the card goes full width rather than holding a grey
          rectangle open for one that was never given. */}
      {project.cover && (
        <div className="proj-media">
          <Morph name={morphName('project', 'cover', project.slug)}>
            <Image
              src={urlFor(project.cover).width(1120).url()}
              alt={project.cover.alt ? stegaClean(project.cover.alt) : ''}
              {...imageSize(project.cover)}
              // Showcase gives the cover the wider of the two columns, so the hint
              // has to move with it or the browser fetches a file it then has to
              // scale up. Same reasoning as the "Also running" covers below.
              sizes={showcase ? '(max-width: 900px) 100vw, 52vw' : '(max-width: 900px) 100vw, 46vw'}
            />
          </Morph>
          {/* Slides up over the bottom of the cover on hover. The card already has a
              "Read the full project" link under the words; this is the same door in
              the place the pointer actually is. */}
          {showcase && href && (
            <span className="proj-open" aria-hidden>
              {locale === 'zh' ? '打开项目' : 'Open the case study'}
              <span className="proj-open-mark">→</span>
            </span>
          )}
        </div>
      )}

      <div className="proj-body">
        {showcase && index !== undefined && (
          <span className="proj-index" aria-hidden>
            {String(index).padStart(2, '0')}
          </span>
        )}
        <div className="proj-kickers">
          {t(project.category, locale) && (
            <span className="proj-kicker">{t(project.category, locale)}</span>
          )}
          {status && (
            <span
              className="proj-status"
              data-shipped={isShipped(project.status)}
              // A dot, only on the one that is actually being worked on. "Validating"
              // and "coming soon" are states; "building" is activity, and it is the
              // only one a pulse would be telling the truth about.
              data-live={stegaClean(project.status ?? '') === 'building' || undefined}
            >
              {status}
            </span>
          )}
        </div>

        <Morph name={morphName('project', 'title', project.slug)}>
          <h3>
            {href ? (
              <Link href={href} transitionTypes={NAV_FORWARD}>
                {projectTitle(project, locale)}
              </Link>
            ) : (
              projectTitle(project, locale)
            )}
          </h3>
        </Morph>

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
          <Link href={href} className="proj-more" transitionTypes={NAV_FORWARD}>
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
  const href = linked ? detailHref('projects', project.slug, locale) : null
  const body = t(project.tagline, locale) || t(project.summary, locale)

  return (
    <article className="proj-compact-item">
      {t(project.category, locale) && (
        <span className="proj-kicker">{t(project.category, locale)}</span>
      )}
      <Morph name={morphName('project', 'title', project.slug)}>
        <h3>
          {href ? (
            <Link href={href} className="proj-compact-stretch" transitionTypes={NAV_FORWARD}>
              {projectTitle(project, locale)}
            </Link>
          ) : (
            projectTitle(project, locale)
          )}
        </h3>
      </Morph>
      {body && <p>{body}</p>}
    </article>
  )
}

/**
 * The strip reads as a footnote to the featured work, so it stays plain text: a name
 * and a line. These are accounts and a student venture with nothing behind them worth
 * a page of their own, and a link that only ever lands on a thin one is worse than no
 * link at all.
 *
 * The one thing that does get added is where to find an account — "抖音 94617971040".
 * That is the whole point of listing a channel here, and since a 抖音号 opens nothing
 * in a browser it is set as text to copy rather than dressed up as a link.
 */
function AlsoRunning({ project, locale }: { project: ProjectCardData; locale: Locale }) {
  const body = t(project.summary, locale) || t(project.tagline, locale)
  const handles = handleLines(project.handles, locale)
  const covers = (project.covers ?? []).filter((c) => c?.asset)

  return (
    <div className="proj-also-item">
      {/* Whole, never cropped and never behind type: an account's cover is already a
          finished piece of artwork with its own headline on it. */}
      {covers.length > 0 && (
        <div className="proj-also-covers">
          {covers.map((cover, i) => (
            <Image
              key={i}
              src={urlFor(cover).width(560).url()}
              alt={cover.alt ? stegaClean(cover.alt) : ''}
              {...imageSize(cover)}
              // 240px is the widest a cover gets: the strip holds them to a height,
              // and a landscape cover 168px tall is about 224px across. This has to
              // be the rendered width rather than a guess under it — the browser
              // picks the smallest source that satisfies it, and a hint of 150px
              // fetched a 150px-wide file, which then became the limit on how big
              // the picture could be drawn. The landscape pair sat two thirds the
              // height of the portrait pair for exactly that reason.
              sizes="(max-width: 700px) 45vw, 240px"
            />
          ))}
        </div>
      )}
      <h4>{projectTitle(project, locale)}</h4>
      {body && <p>{body}</p>}
      {handles.length > 0 && (
        <p className="proj-also-handles">
          {handles.map((handle) => (
            <span key={handle}>{handle}</span>
          ))}
        </p>
      )}
    </div>
  )
}
