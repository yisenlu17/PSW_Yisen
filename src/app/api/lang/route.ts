import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { isLocale, LOCALE_COOKIE } from '@/lib/locale'
import { swapLocale } from '@/lib/href'

/**
 * Sets the language cookie and returns the visitor to the page they were on, in the
 * other language.
 *
 * The language menu no longer comes through here — now that the language is a path
 * segment it can link straight to the translated URL, which keeps the switch a client
 * navigation and lets it animate like any other. This stays for the two cases that
 * cannot do that: a link built before the move, and a visitor with no JavaScript.
 *
 * `next` is validated as a site-relative path before being used — taking it as
 * given would let a crafted link bounce someone from this domain to another one.
 */
export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get('to')
  const next = request.nextUrl.searchParams.get('next') ?? '/'

  const safeNext = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(next) ? next : '/'

  if (!isLocale(to)) {
    return NextResponse.redirect(new URL(safeNext, request.nextUrl.origin))
  }

  ;(await cookies()).set(LOCALE_COOKIE, to, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  return NextResponse.redirect(new URL(swapLocale(safeNext, to), request.nextUrl.origin))
}
