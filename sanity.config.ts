'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool, defineDocuments, defineLocations } from 'sanity/presentation'
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
        // The other half of `locations`: this maps a URL back to the document that
        // produced it. Without it the editing pane keeps whatever document it was
        // opened with, so navigating the preview to another page leaves the editor
        // still pointed at the homepage — every page renders, but only one is
        // editable. Routes are matched top to bottom; `/:slug` is last because it
        // would otherwise swallow the detail routes' first segment.
        mainDocuments: defineDocuments([
          {
            route: '/',
            filter: '_type == "page" && slug.current == "/"',
          },
          {
            route: '/experience/:slug',
            filter: '_type == "experience" && slug.current == $slug',
          },
          {
            route: '/projects/:slug',
            filter: '_type == "project" && slug.current == $slug',
          },
          {
            route: '/:slug',
            filter: '_type == "page" && slug.current == $slug',
          },
        ]),
        locations: {
          // Editing a role tells the editor which pages that role turns up on.
          experience: defineLocations({
            select: { company: 'company', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.company || 'Experience',
                  href: `/experience/${doc?.slug}`,
                },
                { title: 'Experience', href: '/experience' },
                { title: 'Homepage', href: '/' },
              ],
            }),
          }),
          // A project turns up on its own page and on whichever page carries the
          // Projects section, so both are offered rather than only the detail page.
          project: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || 'Project', href: `/projects/${doc?.slug}` },
                { title: 'Projects', href: '/projects' },
                { title: 'Homepage', href: '/' },
              ],
            }),
          }),
          playgroundItem: defineLocations({
            select: { name: 'name' },
            resolve: () => ({
              locations: [{ title: 'Playground', href: '/playground' }],
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
          // Header, footer and site-wide text sit on every page, so the homepage
          // stands in for "everywhere" rather than listing all six.
          navigation: defineLocations({
            locations: [{ title: 'Homepage', href: '/' }],
          }),
          globalSettings: defineLocations({
            locations: [{ title: 'Homepage', href: '/' }],
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
