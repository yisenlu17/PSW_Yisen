import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, type Locale } from './locale'

export const LOCALE_COOKIE = 'lang'

/**
 * The visitor's language, from a cookie rather than a query string.
 *
 * Layouts do not receive searchParams, so a `?lang=` approach cannot reach the
 * header and footer — every page would render its chrome in English while the body
 * switched. A cookie is readable from anywhere on the server, which keeps one
 * language across the whole response.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}
