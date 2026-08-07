import { type SchemaTypeDefinition } from 'sanity'

import { localeString, localeText } from './objects/locale'
import { sectionSettings } from './objects/sectionSettings'
import { heroSection } from './objects/sections/heroSection'
import { experienceSection } from './objects/sections/experienceSection'

import { experience } from './documents/experience'
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
export const sectionTypes = [heroSection, experienceSection]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // primitives
    localeString,
    localeText,
    sectionSettings,
    // sections
    ...sectionTypes,
    // documents
    page,
    experience,
    globalSettings,
    navigation,
  ],
}

/** Documents that must never have more than one instance. */
export const SINGLETON_TYPES = new Set(['globalSettings', 'navigation'])
