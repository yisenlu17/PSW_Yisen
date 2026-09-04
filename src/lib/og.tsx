import { ImageResponse } from 'next/og'
import type { ReactElement } from 'react'

/** What every card in the set is, so the three routes cannot drift apart. */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/** Han characters, plus the CJK compatibility block. */
const CJK = /[\u3400-\u9fff\uf900-\ufaff]/

export function hasCJK(text: string): boolean {
  return CJK.test(text)
}

/**
 * A font that can draw the characters on this particular card.
 *
 * `next/og` ships one default face, Geist, which has no Han glyphs — a Chinese title
 * drawn with it comes out as a row of blank boxes. Google's CSS API will cut a font
 * down to an exact set of characters if you pass them in, so what gets fetched here
 * is a few kilobytes covering this one card rather than a multi-megabyte CJK family.
 *
 * The old user agent is not decoration: asked as a current browser, Google answers
 * with woff2, which Satori cannot read. Asked as something older, it answers with
 * TrueType, which it can.
 *
 * Returns null on any failure, and the caller then draws Latin text instead. A share
 * card is not worth failing a build over.
 */
export async function subsetFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const api =
      'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@600' +
      `&text=${encodeURIComponent(text)}`

    const css = await fetch(api, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64)' },
    }).then((r) => (r.ok ? r.text() : ''))

    // Matched on the declared format rather than on the file extension. Google
    // serves these from a query-string endpoint with no extension at all, so
    // checking the URL for `.ttf` rejects every font it actually returns — which
    // reads as "Chinese unavailable" rather than as a broken test.
    const url = css.match(
      /src:\s*url\((https:\/\/[^)]+)\)\s*format\(['"]?(?:truetype|opentype)['"]?\)/
    )?.[1]
    if (!url) return null

    const font = await fetch(url)
    return font.ok ? await font.arrayBuffer() : null
  } catch {
    return null
  }
}

/**
 * The share card.
 *
 * Typographic on purpose. Pulling the portrait or a project cover in would mean a
 * second network read that can be slow or fail, on an image whose whole job is to
 * exist reliably the moment someone pastes a link. Navy ground, one gold rule, the
 * title, the name — the same four things the site opens with.
 */
export function ogCard({
  eyebrow,
  title,
  footer,
}: {
  eyebrow?: string
  title: string
  footer: string
}): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#061d3d',
        padding: '76px 84px',
      }}
    >
      <div style={{ display: 'flex', width: 92, height: 6, background: '#c8a24b' }} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {eyebrow ? (
          <div
            style={{
              display: 'flex',
              color: '#c8a24b',
              fontSize: 26,
              letterSpacing: 4,
              textTransform: 'uppercase',
              marginBottom: 26,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            color: '#ffffff',
            fontSize: title.length > 46 ? 58 : 72,
            lineHeight: 1.14,
            letterSpacing: -1,
            maxWidth: 940,
          }}
        >
          {title}
        </div>
      </div>

      <div style={{ display: 'flex', color: 'rgba(255,255,255,0.62)', fontSize: 26 }}>
        {footer}
      </div>
    </div>
  )
}

/**
 * Bundles the card with whatever font it needs.
 *
 * Latin text is left to the built-in face — no network, nothing to fail. Only a card
 * carrying Han characters goes and fetches, and if that comes back empty the caller's
 * Latin fallback is used, so there is always a card.
 */
export async function ogFonts(
  text: string
): Promise<{ ok: boolean; fonts: { name: string; data: ArrayBuffer; weight: 600; style: 'normal' }[] }> {
  if (!hasCJK(text)) return { ok: true, fonts: [] }

  const data = await subsetFont(text)
  if (!data) return { ok: false, fonts: [] }

  return { ok: true, fonts: [{ name: 'Noto Sans SC', data, weight: 600, style: 'normal' }] }
}

/** What a card says, in one language. */
export type OgText = { eyebrow?: string; title: string; footer: string }

/**
 * Renders a card, in Chinese if the glyphs can be had and in English if not.
 *
 * The fallback is a whole second set of words rather than a second font, because
 * there is no useful halfway: a card that draws half its title as empty boxes is
 * worse than one that says the same thing in the language the font can draw.
 */
export async function ogImage(wanted: OgText, latin: OgText): Promise<ImageResponse> {
  const text = [wanted.eyebrow, wanted.title, wanted.footer].filter(Boolean).join(' ')
  const { ok, fonts } = await ogFonts(text)

  // The key is omitted rather than passed empty. `next/og` falls back to its built-in
  // face with `options.fonts || defaultFonts`, and an empty array is truthy — passing
  // one hands the renderer no fonts at all, which fails the build rather than
  // degrading, with "No fonts are loaded".
  return new ImageResponse(
    ogCard(ok ? wanted : latin),
    fonts.length > 0 ? { ...OG_SIZE, fonts } : OG_SIZE
  )
}
