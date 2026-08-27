import { stegaClean } from 'next-sanity'

import { DEFAULT_LOCALE, type Locale, type LocaleString, type LocaleText } from './locale'

/**
 * A role as the Experience section receives it.
 *
 * Card fields only. The card points at `/experience/<slug>` rather than opening in
 * place, so the detail — the responsibilities, the numbers, the skills, the portable
 * text story, the images — is fetched by that page for the one role being read,
 * instead of riding along with every card in the section.
 */
export type ExperienceRole = {
  _id: string
  company?: string | null
  companyLocal?: string | null
  slug?: string | null
  role?: LocaleString
  category?: LocaleString
  location?: string | null
  locationLocal?: string | null
  startDate?: string | null
  endDate?: string | null
  featured?: boolean | null
  summary?: LocaleText
  highlight?: LocaleString
}

/**
 * A company's name in the language being read.
 *
 * Not every company has two names, and the ones that do not should not be given
 * one: the site's own Chinese copy writes "在 Orfeostory 同时推进六个企业网站项目"
 * and "在安永独立完成 20 多份财务流程文档" in the same sentence, because that is how
 * the names are actually used. So this is the `titleLocal` bargain from projects,
 * kept identical — a second name where there is one, and the first name everywhere
 * else, rather than a transliteration invented to fill the field.
 */
export function roleCompany(
  role: Pick<ExperienceRole, 'company' | 'companyLocal'>,
  locale: Locale
): string {
  if (locale !== DEFAULT_LOCALE && role.companyLocal && stegaClean(role.companyLocal).trim()) {
    return role.companyLocal
  }
  return role.company ?? ''
}

/** The same bargain for the city. 常州 and Changzhou are the same place, spelled twice. */
export function roleLocation(
  role: Pick<ExperienceRole, 'location' | 'locationLocal'>,
  locale: Locale
): string {
  if (locale !== DEFAULT_LOCALE && role.locationLocal && stegaClean(role.locationLocal).trim()) {
    return role.locationLocal
  }
  return role.location ?? ''
}
