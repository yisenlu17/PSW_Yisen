import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { t, type Locale, type LocaleString } from '@/lib/locale'
import type { SiteSettings } from '@/lib/site'
import { Clock } from './Clock'
import { NavLink } from './NavLink'
import { MobileMenu, type MenuLink } from './MobileMenu'
import { LanguageToggle } from './LanguageToggle'

/**
 * Shaped loosely on purpose: query results arrive stega-branded during preview, so
 * pinning `emphasis` to a union would reject the very values it is meant to accept.
 * Narrowing happens at the point of use, via `stegaClean` plus a fallback.
 */
export type NavigationData = {
  items?: Array<{
    _key: string
    label?: LocaleString | null
    href?: string | null
    external?: boolean | null
    emphasis?: string | null
  }> | null
} | null

export function Header({
  nav,
  site,
  locale,
}: {
  nav: NavigationData
  site: SiteSettings | null
  locale: Locale
}) {
  const items = (nav?.items ?? [])
    .map((i) => ({
      key: i._key,
      label: t(i.label, locale),
      href: i.href ? stegaClean(i.href) : '',
      external: Boolean(i.external),
      emphasis: stegaClean(i.emphasis ?? 'plain'),
    }))
    .filter((i) => i.label && i.href)

  const menuLinks: MenuLink[] = items.map(({ key, label, href, external }) => ({
    key,
    label,
    href,
    external,
  }))

  const initials =
    (site?.name ?? 'Yisen Lu')
      .split(' ')
      .map((w) => stegaClean(w)[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'YL'

  return (
    <header className="masthead">
      <div className="wrap">
        <Link href="/" className="brand">
          <span className="brand-mark">{initials}</span>
          <span className="brand-text">
            <span className="brand-name">{stegaClean(site?.name ?? 'Yisen Lu').toUpperCase()}</span>
            {site?.nameLocal && <span className="brand-local">{stegaClean(site.nameLocal)}</span>}
          </span>
        </Link>

        <nav className="nav">
          {items.map((i) => (
            <NavLink
              key={i.key}
              href={i.href}
              external={i.external}
              className={
                i.emphasis === 'gold'
                  ? 'btn btn-gold nav-cta'
                  : i.emphasis === 'navy'
                    ? 'btn btn-navy nav-cta'
                    : undefined
              }
            >
              {i.label}
            </NavLink>
          ))}
        </nav>

        <div className="masthead-meta">
          <span className="masthead-clock">
            {t(site?.currentLocation, locale) || 'Singapore'} <Clock />
          </span>
          <LanguageToggle current={locale} />
        </div>

        <MobileMenu links={menuLinks} name={stegaClean(site?.name ?? 'Yisen Lu').toUpperCase()} />
      </div>
    </header>
  )
}
