import { type SchemaTypeDefinition } from 'sanity'

import { localeString, localeText, localeFile } from './objects/locale'
import { sectionSettings } from './objects/sectionSettings'
import { heroSection } from './objects/sections/heroSection'
import { experienceSection } from './objects/sections/experienceSection'
import { editorialIntroSection } from './objects/sections/editorialIntroSection'
import { statsSection } from './objects/sections/statsSection'
import { currentlySection } from './objects/sections/currentlySection'
import { ctaSection } from './objects/sections/ctaSection'
import { projectsSection } from './objects/sections/projectsSection'
import { playgroundSection } from './objects/sections/playgroundSection'
import { quoteSection } from './objects/sections/quoteSection'
import { photoGallerySection } from './objects/sections/photoGallerySection'
import { bentoGridSection } from './objects/sections/bentoGridSection'
import { videoFeatureSection } from './objects/sections/videoFeatureSection'
import { videoEmbed } from './objects/videoEmbed'
import { flowSteps } from './objects/flowSteps'

import { experience } from './documents/experience'
import { project } from './documents/project'
import { playgroundItem } from './documents/playgroundItem'
import { page } from './documents/page'
import { globalSettings } from './documents/globalSettings'
import { navigation } from './documents/navigation'

/**
 * Every section type registered here becomes available in the page builder.
 * That registration is the whole contract: a new premium component is written in
 * React, described once as a schema object, added to this list and to `page.sections`,
 * and from then on it is something the editor can add, reorder and hide — without
 * being able to change how it looks.
 */
export const sectionTypes = [
  heroSection,
  editorialIntroSection,
  statsSection,
  experienceSection,
  projectsSection,
  playgroundSection,
  currentlySection,
  quoteSection,
  photoGallerySection,
  bentoGridSection,
  videoFeatureSection,
  ctaSection,
]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // primitives
    localeString,
    localeText,
    localeFile,
    sectionSettings,
    videoEmbed,
    flowSteps,
    // sections
    ...sectionTypes,
    // documents
    page,
    experience,
    project,
    playgroundItem,
    globalSettings,
    navigation,
  ],
}

/** Documents that must never have more than one instance. */
export const SINGLETON_TYPES = new Set(['globalSettings', 'navigation'])
