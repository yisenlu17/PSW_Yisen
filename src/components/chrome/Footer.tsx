import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import { localizeHref } from '@/lib/href'
import { NAV_LATERAL } from '@/components/transitions'
import { resumeSet, type SiteSettings } from '@/lib/site'
import type { NavigationData } from './Header'

/**
 * Spelled out rather than intersected with `NavigationData`: that type is nullable,
 * and `null & {…}` collapses to something no query result can satisfy.
 */
export type FooterData = {
  items?: NonNullable<NavigationData>['items']
  footerStatement?: LocaleText
  footerNote?: LocaleString
  copyright?: LocaleString
} | null

const PLATFORM_LABEL: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  x: 'X',
  instagram: 'Instagram',
  xiaohongshu: '小红书',
  bilibili: '哔哩哔哩',
  youtube: 'YouTube',
}

export function Footer({
  nav,
  site,
  locale,
}: {
  nav: FooterData
  site: SiteSettings | null
  locale: Locale
}) {
  // `external` comes along because the footer lists the same items as the masthead,
  // and one of them may well be somebody else's site. Handing an absolute URL to
  // `<Link>` gets an anchor that works but opens in this tab and has Next trying to
  // prefetch a route that is not one — so the two kinds are told apart here, the way
  // the header already tells them apart.
  const links = (nav?.items ?? [])
    .map((i) => ({
      key: i._key,
      label: t(i.label, locale),
      href: localizeHref(i.href, locale) ?? '',
      external: Boolean(i.external),
    }))
    .filter((i) => i.label && i.href)

  // Only real, filled-in ways to reach someone. An empty column beats a dead link.
  const connect: Array<{ key: string; label: string; href: string; download?: boolean }> = []
  if (site?.email) {
    connect.push({ key: 'email', label: stegaClean(site.email), href: `mailto:${stegaClean(site.email)}` })
  }
  for (const s of site?.socialLinks ?? []) {
    if (!s.url) continue
    const platform = stegaClean(s.platform ?? '')
    connect.push({
      key: s._key,
      label: s.label ? stegaClean(s.label) : (PLATFORM_LABEL[platform] ?? platform),
      href: stegaClean(s.url),
    })
  }
  // With both languages uploaded the footer offers both by name — this is the one
  // place on the site with room to list them, and a visitor who reads the site in one
  // language may well want the CV in the other. With one uploaded it stays a single
  // unlabelled link, because "Résumé (English)" next to nothing else invites a hunt
  // for a Chinese version that does not exist.
  const { zh: resumeZh, en: resumeEn } = resumeSet(site)

  if (resumeZh && resumeEn) {
    connect.push({
      key: 'resume-zh',
      label: locale === 'zh' ? '简历 (中文)' : 'Résumé (中文)',
      href: resumeZh.url,
      download: true,
    })
    connect.push({
      key: 'resume-en',
      label: locale === 'zh' ? '简历 (English)' : 'Résumé (English)',
      href: resumeEn.url,
      download: true,
    })
  } else if (resumeZh || resumeEn) {
    connect.push({
      key: 'resume',
      label: locale === 'zh' ? '简历 (PDF)' : 'Résumé (PDF)',
      href: (resumeZh ?? resumeEn)!.url,
      download: true,
    })
  }

  return (
    <footer className="foot" style={{ viewTransitionName: 'site-footer' }}>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-about">
            {t(nav?.footerStatement, locale) && <p className="foot-statement">{t(nav?.footerStatement, locale)}</p>}
            {t(site?.currentLocation, locale) && (
              <p className="foot-meta">{t(site?.currentLocation, locale)}</p>
            )}
          </div>

          {links.length > 0 && (
            <div className="foot-col">
              <h4>{locale === 'zh' ? '探索' : 'Explore'}</h4>
              {links.map((l) =>
                l.external || /^(https?:|mailto:|tel:)/.test(l.href) ? (
                  <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.key} href={l.href} transitionTypes={NAV_LATERAL}>
                    {l.label}
                  </Link>
                )
              )}
            </div>
          )}

          {connect.length > 0 && (
            <div className="foot-col">
              <h4>{locale === 'zh' ? '联系' : 'Connect'}</h4>
              {connect.map((c) => (
                <a
                  key={c.key}
                  href={c.href}
                  {...(c.download
                    ? { download: '' }
                    : c.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                >
                  {c.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="foot-base">
          {t(nav?.copyright, locale) && <span>{t(nav?.copyright, locale)}</span>}
          {t(nav?.footerNote, locale) && <span>{t(nav?.footerNote, locale)}</span>}
        </div>
      </div>
    </footer>
  )
}
