import { stegaClean } from 'next-sanity'

export const LOCALES = ['en', 'zh'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export type LocaleString = { en?: string | null; zh?: string | null } | null | undefined
export type LocaleText = LocaleString

export function isLocale(value: string | null | undefined): value is Locale {
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

/**
 * The same span, as two years.
 *
 * `formatDateRange` writes "Jul 2026 — Present", which is what a card that has room
 * for it should say. The stacked cards on /experience do not have room: once a card
 * is collapsed, its whole line is a number, a company, a role and a date, and the
 * date is the part that has to give. A year is enough to place a role in a career —
 * the month is on the page the card opens.
 */
export function formatYearRange(
  start: string | null | undefined,
  end: string | null | undefined,
  locale: Locale
): string {
  if (!start) return ''
  const year = (iso: string) => stegaClean(iso).split('-')[0]
  const from = year(start)
  if (!end) return `${from} — ${locale === 'zh' ? '至今' : 'Now'}`
  const to = year(end)
  // A role that started and ended in the same year is one year, not a range.
  return from === to ? from : `${from} — ${to}`
}

/**
 * Where the language preference is remembered.
 *
 * The language itself lives in the URL — this cookie only decides which language a
 * visit to the bare domain lands in, so a returning reader is not sent back to
 * English every time. Declared here rather than in a server module because three
 * very different callers need it: `proxy.ts` reads it off the request, the language
 * menu writes it from the browser, and the route handler sets it as a response
 * cookie.
 */
export const LOCALE_COOKIE = 'lang'

/**
 * Turns the `[locale]` route param into a `Locale`, or nothing.
 *
 * Returning undefined rather than falling back to English is deliberate: `/fr/about`
 * is a URL this site does not have, and answering it with the English page would
 * have Google index the same content under an unbounded number of addresses. The
 * caller sends it to `notFound()` instead.
 */
export function localeParam(value: string | undefined): Locale | undefined {
  return isLocale(value) ? value : undefined
}

/**
 * What goes in `<html lang>`.
 *
 * `zh` alone leaves the script open, and the site is written in simplified
 * characters — a screen reader picking a traditional voice for it is the kind of
 * thing only a reader relying on one would notice.
 */
export function htmlLang(locale: Locale): string {
  return locale === 'zh' ? 'zh-Hans' : 'en'
}

/** The BCP 47 tags used for `hreflang`, keyed by locale. */
export const HREFLANG: Record<Locale, string> = { en: 'en', zh: 'zh-Hans' }
