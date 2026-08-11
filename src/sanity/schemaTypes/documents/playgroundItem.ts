import { defineType, defineField } from 'sanity'
import { PlayIcon } from '@sanity/icons/Play'

/**
 * One thing done outside work.
 *
 * The prototype hard-coded six sports and six interests into the markup, which meant
 * dropping tennis was a code change. They are documents here instead — but the
 * mosaic they render into is not negotiable, so `kind` decides which shape an item
 * takes and nothing else does.
 *
 * `prominent` is the only layout control, and it is deliberately coarse: a prominent
 * sport gets its own tile with a note, the rest are stacked into the last tile as a
 * list. That keeps the grid to four cells however many sports exist.
 */
export const playgroundItem = defineType({
  name: 'playgroundItem',
  title: 'Playground item',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'kind',
      title: 'Kind',
      description:
        'Sports render as tiles in the mosaic. Interests render as pills under "Also me".',
      type: 'string',
      options: {
        list: [
          { title: 'Sport', value: 'sport' },
          { title: 'Interest', value: 'interest' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'sport',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      description: 'English, or whatever it is actually called — 日本語 stays 日本語.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'nameLocal',
      title: 'Name (中文)',
      description: 'The small grey line under the name. Leave empty if there is nothing to add.',
      type: 'string',
    }),
    defineField({
      name: 'note',
      title: 'Note',
      description:
        'One sentence of evidence — what you actually did. Only shown on prominent sports.',
      type: 'localeText',
      hidden: ({ parent }) => parent?.kind !== 'sport',
    }),
    defineField({
      name: 'prominent',
      title: 'Give this its own tile',
      description:
        'Three at most. Everything else is listed together in the fourth tile of the grid.',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => parent?.kind !== 'sport',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      description: 'Lower numbers first.',
      type: 'number',
    }),
  ],

  orderings: [{ title: 'Manual order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],

  preview: {
    select: {
      title: 'name',
      subtitle: 'nameLocal',
      kind: 'kind',
      prominent: 'prominent',
    },
    prepare({ title, subtitle, kind, prominent }) {
      return {
        title: `${prominent ? '★ ' : ''}${title ?? 'Untitled'}`,
        subtitle: [kind === 'sport' ? 'Sport' : 'Interest', subtitle].filter(Boolean).join(' · '),
      }
    },
  },
})
