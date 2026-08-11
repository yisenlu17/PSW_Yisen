import { stegaClean } from 'next-sanity'

import { Section, type SectionSettings } from '@/components/Section'
import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import type { SiteSettings } from '@/lib/site'

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
    href?: string | null
    style?: 'gold' | 'ghost' | null
  }> | null
  settings?: SectionSettings | null
}

/**
 * Turns an intent into a real address using Global settings.
 * Returns null when the detail has not been filled in yet — a button that goes
 * nowhere is worse than one that is not there, especially on a page whose entire
 * purpose is getting someone to make contact.
 */
function resolveHref(
  action: NonNullable<CtaSectionData['actions']>[number],
  site: SiteSettings | null
): string | null {
  switch (stegaClean(action.intent ?? '')) {
    case 'email':
      return site?.email ? `mailto:${stegaClean(site.email)}` : null
    case 'resume':
      return site?.resumeUrl ? stegaClean(site.resumeUrl) : null
    case 'social': {
      const wanted = stegaClean(action.platform ?? '')
      const match = site?.socialLinks?.find((l) => stegaClean(l.platform ?? '') === wanted)
      return match?.url ? stegaClean(match.url) : null
    }
    case 'custom':
      return action.href ? stegaClean(action.href) : null
    default:
      return null
  }
}

export function Cta({
  data,
  locale,
  site,
}: {
  data: CtaSectionData
  locale: Locale
  site: SiteSettings | null
}) {
  const actions = (data.actions ?? [])
    .map((a) => ({ ...a, resolved: resolveHref(a, site) }))
    .filter((a) => a.resolved && t(a.label, locale))

  const missing = (data.actions ?? []).length - actions.length

  return (
    <Section settings={data.settings} className="cta">
      <div className="cta-inner">
        {t(data.eyebrow, locale) && <p className="eyebrow center">{t(data.eyebrow, locale)}</p>}
        {t(data.title, locale) && <h2 className="title">{t(data.title, locale)}</h2>}
        {t(data.body, locale) && <p className="lede">{t(data.body, locale)}</p>}

        {actions.length > 0 && (
          <div className="cta-row">
            {actions.map((a) => (
              <a
                key={a._key}
                href={a.resolved!}
                className={`btn ${stegaClean(a.style ?? 'ghost') === 'gold' ? 'btn-gold' : 'btn-ghost'}`}
                {...(a.resolved!.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {t(a.label, locale)}
              </a>
            ))}
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
