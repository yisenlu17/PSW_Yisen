import type { ReactNode } from 'react'
import { stegaClean } from 'next-sanity'
import { urlFor } from '@/sanity/image'

export type SectionSettings = {
  hidden?: boolean | null
  label?: string | null
  anchorId?: string | null
  theme?: string | null
  spacing?: string | null
  align?: string | null
  animation?: string | null
  imagePosition?: string | null
  backgroundImage?: (Parameters<typeof urlFor>[0] & { alt?: string | null }) | null
  overlay?: string | null
}

/**
 * Turns the editor's settings into classes and nothing else.
 *
 * This is the boundary the whole CMS design rests on: every value arriving here is
 * from a closed list, so the worst an editor can do is pick a theme that reads oddly
 * — never break the layout. Unknown values fall back rather than being passed
 * through, because `stegaClean` output during preview is still just a string and a
 * stale document could carry a variant that no longer exists.
 */
export function Section({
  settings,
  children,
  className,
}: {
  settings?: SectionSettings | null
  children: ReactNode
  className?: string
}) {
  const theme = pick(settings?.theme, ['light', 'cream', 'dark', 'accent'], 'light')
  const spacing = pick(settings?.spacing, ['compact', 'normal', 'large'], 'normal')
  const align = pick(settings?.align, ['left', 'center'], 'left')
  const animation = pick(settings?.animation, ['default', 'reduced', 'none'], 'default')
  const imagePosition = pick(settings?.imagePosition, ['right', 'left'], 'right')
  const overlay = pick(settings?.overlay, ['light', 'medium', 'heavy'], 'medium')

  const background = settings?.backgroundImage
    ? urlFor(settings.backgroundImage).width(2000).quality(70).url()
    : null

  return (
    <section
      id={cleanAnchor(settings?.anchorId)}
      data-theme={theme}
      data-spacing={spacing}
      data-align={align}
      data-animation={animation}
      data-image-position={imagePosition}
      data-overlay={background ? overlay : undefined}
      className={['section', background ? 'has-background' : null, className]
        .filter(Boolean)
        .join(' ')}
    >
      {background && (
        // Decorative: whatever the section says is in the markup already, so
        // announcing the backdrop as well would just be noise.
        <div
          className="section-bg"
          aria-hidden
          style={{ backgroundImage: `url(${background})` }}
        />
      )}
      <div className="wrap">{children}</div>
    </section>
  )
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const clean = typeof value === 'string' ? (stegaClean(value) as T) : undefined
  return clean && allowed.includes(clean) ? clean : fallback
}

function cleanAnchor(value: string | null | undefined): string | undefined {
  const clean = value ? stegaClean(value).trim() : ''
  return /^[a-z0-9-]+$/.test(clean) ? clean : undefined
}
