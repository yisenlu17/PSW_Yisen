import type { StructureResolver } from 'sanity/structure'
// @sanity/icons v5 dropped the named barrel export; icons ship as subpath modules.
import { CogIcon } from '@sanity/icons/Cog'
import { MenuIcon } from '@sanity/icons/Menu'
import { DocumentIcon } from '@sanity/icons/Document'
import { CaseIcon } from '@sanity/icons/Case'

/**
 * Studio navigation.
 *
 * Singletons are opened directly as their one document rather than as a list with a
 * single row and a "create" button that must never be pressed.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentIcon)
        .child(S.documentTypeList('page').title('Pages')),

      S.divider(),

      S.listItem()
        .title('Experience')
        .icon(CaseIcon)
        .child(
          S.documentTypeList('experience')
            .title('Experience')
            .defaultOrdering([{ field: 'startDate', direction: 'desc' }])
        ),

      S.divider(),

      S.listItem()
        .title('Global settings')
        .icon(CogIcon)
        .child(S.document().schemaType('globalSettings').documentId('globalSettings')),

      S.listItem()
        .title('Navigation & footer')
        .icon(MenuIcon)
        .child(S.document().schemaType('navigation').documentId('navigation')),
    ])
