import { stegaClean } from 'next-sanity'

import { urlFor } from '@/sanity/image'
import { t, type Locale } from '@/lib/locale'
import { siteOrigin } from '@/lib/site-url'
import type { SiteSettings } from '@/lib/site'

/**
 * Who this site is about, said in a form a search engine can read.
 *
 * The reason to bother: someone types a name into Google after a CV lands on their
 * desk. Without this there is a page that happens to contain the name; with it there
 * is a person, with a job title, a photo and a set of accounts that corroborate each
 * other — which is what decides whether this site or somebody else with the same
 * name comes back.
 *
 * `sameAs` is doing most of that work. It is the claim that the LinkedIn and the
 * GitHub in the footer are the same person as the one this page is about.
 */
export function PersonSchema({ site, locale }: { site: SiteSettings | null; locale: Locale }) {
  if (!site) return null

  const name = clean(site.name) || 'Yisen Lu'
  const sameAs = (site.socialLinks ?? [])
    .map((link) => clean(link.url))
    .filter((url): url is string => Boolean(url) && /^https?:\/\//.test(url))

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: `${siteOrigin()}/${locale}`,
  }

  const localName = clean(site.nameLocal)
  if (localName && localName !== name) schema.alternateName = localName

  const jobTitle = t(site.currentRole, locale)
  if (jobTitle) schema.jobTitle = stegaClean(jobTitle)

  const description = t(site.shortBio, locale)
  if (description) schema.description = stegaClean(description)

  const email = clean(site.email)
  if (email) schema.email = `mailto:${email}`

  const place = t(site.currentLocation, locale)
  if (place) {
    schema.address = { '@type': 'PostalAddress', addressLocality: stegaClean(place) }
  }

  if (site.profileImage?.asset) {
    schema.image = urlFor(site.profileImage).width(800).height(800).fit('crop').url()
  }

  if (sameAs.length > 0) schema.sameAs = sameAs

  return (
    <script
      type="application/ld+json"
      // Not user input: every value here comes from the one settings document, and
      // `JSON.stringify` is what makes it safe to sit inside a script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/** Studio strings arrive stega-branded in preview; structured data must not. */
function clean(value: string | null | undefined): string {
  return value ? stegaClean(value).trim() : ''
}
