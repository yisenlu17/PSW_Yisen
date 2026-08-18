import type { LocaleString, LocaleText } from './locale'

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
  slug?: string | null
  role?: LocaleString
  category?: LocaleString
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  featured?: boolean | null
  summary?: LocaleText
  highlight?: LocaleString
}
