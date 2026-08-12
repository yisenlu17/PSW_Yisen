import { t, type Locale, type LocaleString, type LocaleText } from './locale'

/**
 * A role as the Experience section receives it.
 *
 * Card fields and the ones an expanded card reveals travel together in one query.
 * There are only ever a handful of roles, so carrying what an expansion needs costs
 * far less than a second request fired the moment somebody clicks — and a card that
 * takes a visible beat to open reads as broken rather than as considered.
 *
 * `fullStory`, images and attachments are deliberately absent: those are what makes
 * `/experience/<slug>` worth opening, and dragging a portable-text body per card
 * across the wire to render four bullet points is the trade the card is avoiding.
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
  secondary?: LocaleText
  highlight?: LocaleString
  skills?: string[] | null
  responsibilities?: LocaleString[] | null
  problemsSolved?: LocaleString[] | null
  metrics?: Array<{ _key: string; value?: string | null; label?: LocaleString }> | null
}

/** What an expanded card has to show, resolved into one language. */
export type RoleDetail = {
  secondary: string
  responsibilities: string[]
  problems: string[]
  metrics: Array<{ _key: string; value?: string | null; label: string }>
  skills: string[]
  hasDetail: boolean
}

/**
 * Resolves a role's expandable content for one locale.
 *
 * `hasDetail` is the reason this is a function rather than inline JSX: a card with
 * nothing behind it must not grow a toggle that opens onto an empty box. Roles are
 * filled in over time, so at any moment some have detail and some do not, and the
 * section has to look deliberate either way.
 */
export function roleDetail(role: ExperienceRole, locale: Locale): RoleDetail {
  const responsibilities = (role.responsibilities ?? []).map((r) => t(r, locale)).filter(Boolean)
  const problems = (role.problemsSolved ?? []).map((p) => t(p, locale)).filter(Boolean)
  const metrics = (role.metrics ?? [])
    .map((m) => ({ _key: m._key, value: m.value, label: t(m.label, locale) }))
    .filter((m) => m.value)
  const skills = (role.skills ?? []).filter(Boolean)
  const secondary = t(role.secondary, locale)

  return {
    secondary,
    responsibilities,
    problems,
    metrics,
    skills,
    hasDetail: Boolean(
      secondary || responsibilities.length || problems.length || metrics.length || skills.length
    ),
  }
}
