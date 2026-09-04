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
        // editable. Routes are matched top to bottom; `/:locale/:slug` is last
        // because it would otherwise swallow the detail routes' first segment.
        //
        // Every route opens with `:locale` because the language is the first segment
        // of every address on the site. It is captured and thrown away: the same
        // document is behind `/en/projects/vora` and `/zh/projects/vora`, and which
        // language the preview happens to be showing does not change which document
        // the editor should be editing.
        mainDocuments: defineDocuments([
          {
            route: '/:locale',
            filter: '_type == "page" && slug.current == "/"',
          },
          {
            route: '/:locale/experience/:slug',
            filter: '_type == "experience" && slug.current == $slug',
          },
          {
            route: '/:locale/projects/:slug',
            filter: '_type == "project" && slug.current == $slug',
          },
          {
            route: '/:locale/:slug',
            filter: '_type == "page" && slug.current == $slug',
          },
        ]),
        // Every location is given in English. A document appears at two addresses
        // now, one per language, and listing both would double a list whose job is
        // to be glanced at — the preview carries the site's own language menu, so
        // the other one is a click away rather than a second entry.
        locations: {
          // Editing a role tells the editor which pages that role turns up on.
          experience: defineLocations({
            select: { company: 'company', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.company || 'Experience',
                  href: `/en/experience/${doc?.slug}`,
                },
                { title: 'Experience', href: '/en/experience' },
                { title: 'Homepage', href: '/en' },
              ],
            }),
          }),
          // A project turns up on its own page and on whichever page carries the
          // Projects section, so both are offered rather than only the detail page.
          project: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || 'Project', href: `/en/projects/${doc?.slug}` },
                { title: 'Projects', href: '/en/projects' },
                { title: 'Homepage', href: '/en' },
              ],
            }),
          }),
          playgroundItem: defineLocations({
            select: { name: 'name' },
            resolve: () => ({
              locations: [{ title: 'Playground', href: '/en/playground' }],
            }),
          }),
          page: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Page',
                  href: doc?.slug === '/' ? '/en' : `/en/${doc?.slug}`,
                },
              ],
            }),
          }),
          // Header, footer and site-wide text sit on every page, so the homepage
          // stands in for "everywhere" rather than listing all six.
          navigation: defineLocations({
            locations: [{ title: 'Homepage', href: '/en' }],
          }),
          globalSettings: defineLocations({
            locations: [{ title: 'Homepage', href: '/en' }],
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
