import { stegaClean } from 'next-sanity'

import { ResumeDownload } from '@/components/ResumeDownload'
import { Section, type SectionSettings } from '@/components/Section'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import { localizeHref } from '@/lib/href'
import { resumeFor, resumeSet, type ResumeChoice, type SiteSettings } from '@/lib/site'

export type CtaSectionData = {
  _key: string
  _type: 'ctaSection'
  eyebrow?: LocaleString
  title?: LocaleString
  body?: LocaleText
  actions?: Array<{
    _key: string
    label?: LocaleString
    intent?: 'email' | 'resume' | 'social' | 'custom' | null
    platform?: string | null
    resumeLanguage?: string | null
    href?: string | null
    style?: 'gold' | 'ghost' | null
  }> | null
  settings?: SectionSettings | null
}

/** Which résumé an editor pinned, defaulting to letting the visitor pick. */
function resumeChoice(action: NonNullable<CtaSectionData['actions']>[number]): ResumeChoice {
  return (stegaClean(action.resumeLanguage ?? 'ask') || 'ask') as ResumeChoice
}

/**
 * Turns an intent into a real address using Global settings.
 * Returns null when the detail has not been filled in yet — a button that goes
 * nowhere is worse than one that is not there, especially on a page whose entire
 * purpose is getting someone to make contact.
 */
function resolveHref(
  action: NonNullable<CtaSectionData['actions']>[number],
  site: SiteSettings | null,
  locale: Locale
): string | null {
  switch (stegaClean(action.intent ?? '')) {
    case 'email':
      return site?.email ? `mailto:${stegaClean(site.email)}` : null
    case 'resume':
      // `ask` resolves like `auto` here: this is the href the button falls back to
      // when there is only one PDF and so nothing to ask about.
      return resumeFor(site, locale, resumeChoice(action))?.url ?? null
    case 'social': {
      const wanted = stegaClean(action.platform ?? '')
      const match = site?.socialLinks?.find((l) => stegaClean(l.platform ?? '') === wanted)
      return match?.url ? stegaClean(match.url) : null
    }
    case 'custom':
      return localizeHref(action.href, locale)
    default:
      return null
  }
}

export function Cta({
  data,
  locale,
  site,
  index,
}: {
  data: CtaSectionData
  locale: Locale
  site: SiteSettings | null
  index?: number
}) {
  const resumes = resumeSet(site)

  const actions = (data.actions ?? [])
    .map((a) => {
      const intent = stegaClean(a.intent ?? '')
      return {
        ...a,
        resolved: resolveHref(a, site, locale),
        isDownload: intent === 'resume',
        // With both PDFs uploaded and no language pinned, the button opens a menu
        // rather than picking for the visitor: which language someone wants the CV in
        // is not the same question as which language they are reading the site in.
        asks: intent === 'resume' && resumeChoice(a) === 'ask' && Boolean(resumes.en && resumes.zh),
      }
    })
    .filter((a) => a.resolved && t(a.label, locale))

  const missing = (data.actions ?? []).length - actions.length

  return (
    <Section settings={data.settings} index={index} className="cta">
      <div className="cta-inner">
        {t(data.eyebrow, locale) && <p className="eyebrow center">{t(data.eyebrow, locale)}</p>}
        {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
        {t(data.body, locale) && <p className="lede">{t(data.body, locale)}</p>}

        {actions.length > 0 && (
          <div className="cta-row">
            {actions.map((a) => {
              const className = `btn magnetic ${stegaClean(a.style ?? 'ghost') === 'gold' ? 'btn-gold' : 'btn-ghost'}`

              return a.asks ? (
                <ResumeDownload
                  key={a._key}
                  label={t(a.label, locale)}
                  className={className}
                  files={{ en: resumes.en!, zh: resumes.zh! }}
                  locale={locale}
                />
              ) : (
                <a
                  key={a._key}
                  href={a.resolved!}
                  className={className}
                  {...(a.isDownload
                    ? // A download must not open a tab: `target="_blank"` on a `?dl=` URL
                      // flashes a blank window that closes itself the moment the file
                      // starts, which reads as the button having failed.
                      { download: '' }
                    : a.resolved!.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                >
                  {t(a.label, locale)}
                </a>
              )
            })}
          </div>
        )}

        {/* Visible only to the editor, so an unfilled contact detail is noticed
            before a visitor finds a section with no way to reach anyone. */}
        {missing > 0 && process.env.NODE_ENV === 'development' && (
          <p className="cta-warning">
            {missing} button{missing > 1 ? 's are' : ' is'} hidden — fill in the matching
            detail under Global settings.
          </p>
        )}
      </div>
    </Section>
  )
}
