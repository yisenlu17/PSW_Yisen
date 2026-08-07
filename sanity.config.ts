'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool, defineLocations } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'

import { apiVersion, dataset, projectId } from '@/sanity/env'
import { schema, SINGLETON_TYPES } from '@/sanity/schemaTypes'
import { structure } from '@/sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,

  plugins: [
    structureTool({ structure }),

    // Click text on the site to jump to its field; drag sections to reorder them.
    presentationTool({
      previewUrl: {
        previewMode: { enable: '/api/draft-mode/enable' },
      },
      resolve: {
        locations: {
          // Editing a role tells the editor which pages that role turns up on.
          experience: defineLocations({
            select: { company: 'company', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: 'Homepage', href: '/' },
                {
                  title: doc?.company || 'Experience',
                  href: `/experience/${doc?.slug}`,
                },
              ],
            }),
          }),
          page: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Page',
                  href: doc?.slug === '/' ? '/' : `/${doc?.slug}`,
                },
              ],
            }),
          }),
        },
      },
    }),

    visionTool({ defaultApiVersion: apiVersion }),
  ],

  document: {
    // Singletons are reachable through the structure only — never created ad hoc.
    newDocumentOptions: (prev) =>
      prev.filter((item) => !SINGLETON_TYPES.has(item.templateId)),
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? prev.filter(({ action }) => action !== 'duplicate' && action !== 'delete')
        : prev,
  },
})
