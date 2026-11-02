import { NextResponse, type NextRequest } from 'next/server'

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, isLocale, type Locale } from '@/lib/locale'

/**
 * Sends the bare domain to a language, and old links to where they moved.
 *
 * Named `proxy` rather than `middleware`: the `middleware` file convention is
 * deprecated in Next 16 and this is what replaced it.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // A file, not a page — `fonts/*.woff2`, `robots.txt`, an SVG. This lives here
  // rather than in the matcher below because the matcher is parsed by path-to-regexp,
  // which strips the backslash out of `\.` and leaves `.*.` — a pattern that matches
  // every non-empty path. Written there, it excluded the entire site except `/`.
  if (/\.[^/]*$/.test(pathname)) return NextResponse.next()

  const [first] = pathname.split('/').filter(Boolean)
  if (isLocale(first)) return NextResponse.next()

  // Everything that shipped before the language moved into the URL was English, and
  // those addresses are in someone's history and, by now, in an index. 308 keeps the
  // method and tells crawlers to move their record — and it points at `/en` rather
  // than at a preference, because a permanent redirect that varies per visitor is one
  // a cache will hand to the wrong person.
  if (pathname !== '/') {
    const target = request.nextUrl.clone()
    target.pathname = `/${DEFAULT_LOCALE}${pathname}`
    return NextResponse.redirect(target, 308)
  }

  const target = request.nextUrl.clone()
  target.pathname = `/${preferredLocale(request)}`
  return NextResponse.redirect(target)
}

/**
 * Where a reader is, as Vercel's edge sees it: an ISO country code, set on every
 * request it forwards and overwritten when a client sends its own.
 */
const COUNTRY_HEADER = 'x-vercel-ip-country'

/**
 * Which language the bare domain opens in: what you last chose, else where you are
 * opening it from — mainland China reads Chinese, everywhere else English — else,
 * off Vercel where there is no country to go on, what your browser asks for.
 *
 * Only the mainland counts. Hong Kong, Macau and Taiwan have codes of their own and
 * open in English, which is what was asked for; a reader there who wants Chinese is
 * one tap away, and the cookie keeps that choice.
 *
 * Temporary by nature — it is a different answer for different people, so the
 * redirect above must not be cached as though it were one answer.
 */
function preferredLocale(request: NextRequest): Locale {
  const remembered = request.cookies.get(LOCALE_COOKIE)?.value
  if (isLocale(remembered)) return remembered

  const country = request.headers.get(COUNTRY_HEADER)
  if (country) return country.toUpperCase() === 'CN' ? 'zh' : 'en'

  const header = request.headers.get('accept-language')
  if (!header) return DEFAULT_LOCALE

  // `zh-CN;q=0.9` — the tag is what matters, and only its primary subtag, so both
  // `zh-CN` and `zh-Hans-CN` land on the same place.
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...rest] = part.trim().split(';')
      const q = rest.find((p) => p.trim().startsWith('q='))
      return { tag: tag.toLowerCase(), q: q ? Number(q.trim().slice(2)) || 0 : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const primary = tag.split('-')[0]
    const match = LOCALES.find((locale) => locale === primary)
    if (match) return match
  }

  return DEFAULT_LOCALE
}

/**
 * Skips the build output, the API and the studio, none of which are language-specific.
 *
 * Deliberately free of escapes: path-to-regexp rewrites this string before it becomes
 * a regex, and a `\.` does not survive the trip — it arrives as `.*.`, which matches
 * every non-empty path and so excluded the entire site except `/`. Files are filtered
 * in the function body instead, where the regex is a regex.
 */
export const config = {
  matcher: ['/((?!_next|api|studio).*)'],
}
