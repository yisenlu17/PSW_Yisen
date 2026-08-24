import NextImage from 'next/image'
import { stegaClean } from 'next-sanity'
import { PortableText, type PortableTextBlock, type PortableTextComponents } from '@portabletext/react'

import { urlFor } from '@/sanity/image'
import { t, type Locale, type LocaleString } from '@/lib/locale'
import type { SanityImage } from '@/lib/project'

/**
 * A chain of steps, as chips rather than a paragraph of arrows.
 *
 * The arrows belong here rather than to whoever typed the content, which is what
 * lets `set` drop them for a group that has no order — and what stops a nine-step
 * chain from wrapping into an unreadable line on a phone.
 */
function FlowSteps({ value }: { value: FlowStepsValue }) {
  const steps = (value.steps ?? []).filter(Boolean)
  if (steps.length === 0) return null

  const label = value.label
  const variant = value.variant ? stegaClean(value.variant) : 'chain'
  const List = variant === 'set' ? 'ul' : 'ol'

  return (
    <div className="flow" data-variant={variant}>
      {label && <p className="flow-label">{label}</p>}
      <List className="flow-steps">
        {steps.map((step, i) => (
          <li key={i} className="flow-step">
            <span>{step}</span>
          </li>
        ))}
      </List>
    </div>
  )
}

type FlowStepsValue = {
  label?: string | null
  variant?: string | null
  steps?: string[] | null
}

/**
 * Long-form copy, rendered with the site's own type rather than the browser's.
 *
 * The block schema offers exactly three styles, two lists and one step chain, so this
 * map is complete: anything not listed here cannot be produced in the studio. Links
 * get `rel="noopener"` here rather than being trusted to whoever pasted them.
 */
function components(locale: Locale): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p>{children}</p>,
      h3: ({ children }) => <h3>{children}</h3>,
      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    },
    list: {
      bullet: ({ children }) => <ul>{children}</ul>,
      number: ({ children }) => <ol>{children}</ol>,
    },
    marks: {
      link: ({ children, value }) => {
        const href = typeof value?.href === 'string' ? stegaClean(value.href) : ''
        if (!href) return <>{children}</>
        const external = href.startsWith('http')
        return (
          <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {children}
          </a>
        )
      },
      code: ({ children }) => <code>{children}</code>,
    },
    types: {
      flowSteps: ({ value }) => <FlowSteps value={value as FlowStepsValue} />,
      image: ({ value }) => {
        const image = value as SanityImage
        if (!image?.asset) return null
        const caption = t(image.caption as LocaleString, locale)
        return (
          <figure className="body-figure">
            <NextImage
              src={urlFor(image).width(1400).url()}
              alt={image.alt ? stegaClean(image.alt) : ''}
              width={700}
              height={470}
              sizes="(max-width: 800px) 100vw, 720px"
            />
            {caption && <figcaption>{caption}</figcaption>}
          </figure>
        )
      },
    },
  }
}

/**
 * Picks the language-specific body, falling back to English exactly as `t` does for
 * plain strings — a project written up in English only still reads in Chinese rather
 * than showing a blank page.
 */
export function PortableBody({
  value,
  valueZh,
  locale,
}: {
  value?: PortableTextBlock[] | null
  valueZh?: PortableTextBlock[] | null
  locale: Locale
}) {
  const chosen = locale === 'zh' && valueZh?.length ? valueZh : value
  if (!chosen?.length) return null

  return (
    <div className="rich-text">
      <PortableText value={chosen} components={components(locale)} />
    </div>
  )
}
