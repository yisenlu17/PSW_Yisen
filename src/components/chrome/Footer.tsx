import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { t, type Locale, type LocaleString, type LocaleText } from '@/lib/locale'
import type { SiteSettings } from '@/lib/site'
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
  const links = (nav?.items ?? [])
    .map((i) => ({ key: i._key, label: t(i.label, locale), href: i.href ? stegaClean(i.href) : '' }))
    .filter((i) => i.label && i.href)

  // Only real, filled-in ways to reach someone. An empty column beats a dead link.
  const connect: Array<{ key: string; label: string; href: string }> = []
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
  if (site?.resumeUrl) {
    connect.push({
      key: 'resume',
      label: locale === 'zh' ? '简历 (PDF)' : 'Résumé (PDF)',
      href: stegaClean(site.resumeUrl),
    })
  }

  return (
    <footer className="foot">
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
              {links.map((l) => (
                <Link key={l.key} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {connect.length > 0 && (
            <div className="foot-col">
              <h4>{locale === 'zh' ? '联系' : 'Connect'}</h4>
              {connect.map((c) => (
                <a
                  key={c.key}
                  href={c.href}
                  {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
