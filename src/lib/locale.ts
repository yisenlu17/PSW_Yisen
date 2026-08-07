import { stegaClean } from 'next-sanity'

export const LOCALES = ['en', 'zh'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export type LocaleString = { en?: string | null; zh?: string | null } | null | undefined
export type LocaleText = LocaleString

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale)
}

/**
 * Reads one side of a bilingual field, falling back to English.
 *
 * A half-translated document should render the English rather than a blank space,
 * so an editor adding a role in one language never ships an empty section. The
 * returned string keeps its stega encoding so clicking it in Presentation still
 * opens the right field.
 */
export function t(value: LocaleString, locale: Locale): string {
  if (!value) return ''
  const wanted = value[locale]
  if (wanted && stegaClean(wanted).trim()) return wanted
  const fallback = value[DEFAULT_LOCALE]
  return fallback && stegaClean(fallback).trim() ? fallback : ''
}

/** Formats a role's date range per locale. Open-ended ranges read as "Present" / "至今". */
export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  locale: Locale
): string {
  if (!start) return ''
  const fmt = (iso: string) => {
    const [y, m] = stegaClean(iso).split('-')
    if (!m) return y
    return locale === 'zh'
      ? `${y} 年 ${Number(m)} 月`
      : `${new Date(Number(y), Number(m) - 1).toLocaleString('en-GB', { month: 'short' })} ${y}`
  }
  const current = locale === 'zh' ? '至今' : 'Present'
  return `${fmt(start)} — ${end ? fmt(end) : current}`
}
