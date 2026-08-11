import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { isLocale } from '@/lib/locale'
import { LOCALE_COOKIE } from '@/lib/locale-server'

/**
 * Sets the language cookie and returns the visitor to the page they were on.
 *
 * `next` is validated as a site-relative path before being used — taking it as
 * given would let a crafted link bounce someone from this domain to another one.
 */
export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get('to')
  const next = request.nextUrl.searchParams.get('next') ?? '/'

  const safeNext = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(next) ? next : '/'

  if (isLocale(to)) {
    ;(await cookies()).set(LOCALE_COOKIE, to, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return NextResponse.redirect(new URL(safeNext, request.nextUrl.origin))
}
