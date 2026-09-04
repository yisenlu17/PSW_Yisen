import Image from 'next/image'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'

import { t, type Locale, type LocaleString } from '@/lib/locale'
import { detailHref, homeHref, localizeHref } from '@/lib/href'
import { urlFor } from '@/sanity/image'
import { projectTitle } from '@/lib/project'
import { roleCompany } from '@/lib/experience'
import type { SiteSettings } from '@/lib/site'
import { Clock } from './Clock'
import { NavLink } from './NavLink'
import { NavGroup, type NavChild } from './NavGroup'
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

/** The documents behind `/experience/<slug>` and `/projects/<slug>`, named only. */
export type NavChildrenData = {
  experience?: Array<{
    _id: string
    company?: string | null
    companyLocal?: string | null
    role?: LocaleString | null
    slug?: string | null
  }> | null
  projects?: Array<{
    _id: string
    title?: string | null
    titleLocal?: string | null
    tagline?: LocaleString | null
    category?: LocaleString | null
    featured?: boolean | null
    slug?: string | null
  }> | null
} | null

/** Trailing slashes are an authoring accident, not a different destination. */
function normalise(href: string): string {
  return href.length > 1 ? href.replace(/\/+$/, '') : href
}

export function Header({
  nav,
  subpages,
  site,
  locale,
}: {
  nav: NavigationData
  subpages: NavChildrenData
  site: SiteSettings | null
  locale: Locale
}) {
  // Which menu item owns which subpages is decided by where the item points, not by
  // a field an editor would have to keep in sync with the routes. Renaming
  // "Experience" to "Where I've worked" therefore keeps its drop-down; pointing it
  // somewhere else drops it, which is the right answer both times.
  const byHref = new Map<string, NavChild[]>()

  // `flatMap` rather than map-then-filter: `detailHref` returns null for a slug that
  // cannot be one, and dropping the entry in the same step is what makes `href` a
  // string here without asserting it.
  const roles: NavChild[] = (subpages?.experience ?? []).flatMap((role) => {
    const href = detailHref('experience', role.slug, locale)
    if (!href || !role.company) return []
    return [
      {
        key: role._id,
        href,
        label: roleCompany(role, locale),
        note: t(role.role, locale) || undefined,
      },
    ]
  })
  if (roles.length > 0) byHref.set('/experience', roles)

  // Only the projects that have a page. The accounts in "Also running" are set as
  // plain text on the Projects page for the good reason that there is nothing behind
  // them worth opening, so the menu must not offer a door the page itself withholds.
  // Same rule as `ProjectsSection`, tickbox and fallback both: nothing featured means
  // nothing has been sorted yet, and everything shows.
  const projects = (subpages?.projects ?? []).filter((project) => project.slug && project.title)
  const hasPage = projects.some((project) => project.featured)

  const work: NavChild[] = (hasPage ? projects.filter((project) => project.featured) : projects)
    .flatMap((project) => {
      const href = detailHref('projects', project.slug, locale)
      if (!href) return []
      return [
        {
          key: project._id,
          href,
          label: projectTitle(project, locale),
          note: t(project.tagline, locale) || t(project.category, locale) || undefined,
        },
      ]
    })
  if (work.length > 0) byHref.set('/projects', work)

  const items = (nav?.items ?? [])
    .map((i) => {
      // Two forms of the same link. An editor types `/experience`, and that is what
      // the subpage map is keyed by — so matching uses what was typed, while the
      // rendered link is the one carrying the language. Localising before the lookup
      // would silently empty every drop-down.
      const authored = i.href ? stegaClean(i.href) : ''
      const external = Boolean(i.external)
      return {
        key: i._key,
        label: t(i.label, locale),
        href: localizeHref(authored, locale) ?? '',
        external,
        emphasis: stegaClean(i.emphasis ?? 'plain'),
        // An external link is somebody else's site, and has no subpages here.
        children: external ? [] : (byHref.get(normalise(authored)) ?? []),
      }
    })
    .filter((i) => i.label && i.href)

  const menuLinks: MenuLink[] = items.map(({ key, label, href, external, children: sub }) => ({
    key,
    label,
    href,
    external,
    children: sub,
  }))

  // 卢一森 in 中文, YISEN LU in English. Upper-casing is a Latin idea and does
  // nothing to Chinese characters, so it is applied only where it means something.
  const localName = site?.nameLocal ? stegaClean(site.nameLocal).trim() : ''
  const brandName =
    locale === 'zh' && localName
      ? localName
      : stegaClean(site?.name ?? 'Yisen Lu').toUpperCase()

  const initials =
    (site?.name ?? 'Yisen Lu')
      .split(' ')
      .map((w) => stegaClean(w)[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'YL'

  // The mark is the profile photo once one is uploaded, and the initials until then —
  // so the corner of every page is never empty, and never a broken image either. The
  // photo is cropped square to a hotspot an editor can set, because a portrait
  // centred on nothing lands on a chin as often as on a face.
  const photo = site?.profileImage?.asset ? site.profileImage : null

  return (
    <header className="masthead">
      <div className="wrap">
        <Link href={homeHref(locale)} className="brand">
          <span className="brand-mark">
            {photo ? (
              <Image
                src={urlFor(photo).width(96).height(96).fit('crop').url()}
                alt=""
                width={48}
                height={48}
                priority
              />
            ) : (
              initials
            )}
          </span>
          {/* One name, in the language being read. The pair stacked was the
              prototype's masthead, and it means whichever language you chose, you
              read past the other one every time you look at the header. */}
          <span className="brand-text">
            <span className="brand-name">{brandName}</span>
          </span>
        </Link>

        <nav className="nav">
          {items.map((i) => {
            const className =
              i.emphasis === 'gold'
                ? 'btn btn-gold nav-cta'
                : i.emphasis === 'navy'
                  ? 'btn btn-navy nav-cta'
                  : undefined

            return i.children.length > 0 ? (
              <NavGroup
                key={i.key}
                href={i.href}
                label={i.label}
                items={i.children}
                locale={locale}
                className={className}
              />
            ) : (
              <NavLink key={i.key} href={i.href} external={i.external} className={className}>
                {i.label}
              </NavLink>
            )
          })}
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
