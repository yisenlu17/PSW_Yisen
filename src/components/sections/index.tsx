import { createDataAttribute } from 'next-sanity'

import { Hero, type HeroSectionData } from './Hero'
import { ExperienceSection, type ExperienceSectionData } from './ExperienceSection'
import type { Locale } from '@/lib/locale'

export type SectionData = HeroSectionData | ExperienceSectionData

/**
 * The registry. Adding a premium component means writing it, describing it as a
 * schema object, and adding both here and to `page.sections` — after that it is
 * something an editor can add, reorder and hide, with no further code involved.
 */
const RENDERERS = {
  heroSection: Hero,
  experienceSection: ExperienceSection,
} as const

export function SectionRenderer({
  sections,
  documentId,
  documentType,
  locale,
}: {
  sections: SectionData[] | null | undefined
  documentId: string
  documentType: string
  locale: Locale
}) {
  const visible = (sections ?? []).filter((s) => !s.settings?.hidden)

  // Presentation needs the array itself tagged, plus every item inside it, before it
  // will offer drag handles. Tagging only the items yields hover highlights but no
  // reordering, which looks like a bug rather than a missing attribute.
  const attr = createDataAttribute({ id: documentId, type: documentType })

  return (
    <main data-sanity={attr.scope(['sections']).toString()}>
      {visible.map((section) => {
        const Component = RENDERERS[section._type] as
          | ((props: { data: SectionData; locale: Locale }) => React.ReactNode)
          | undefined

        if (!Component) {
          // A section type removed from the code but still present in a document
          // must not take the page down with it.
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[sections] no renderer for "${section._type}" (_key: ${section._key})`)
          }
          return null
        }

        return (
          <div
            key={section._key}
            data-sanity={attr.scope(['sections', { _key: section._key }]).toString()}
          >
            <Component data={section} locale={locale} />
          </div>
        )
      })}
    </main>
  )
}
