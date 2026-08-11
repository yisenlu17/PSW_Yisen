import { defineType, defineField, defineArrayMember } from 'sanity'
import { PlayIcon } from '@sanity/icons/Play'

/**
 * The life-outside-work mosaic.
 *
 * Three columns that are not interchangeable: a tiled grid of sports, an image
 * stacked over a dark statement panel, and a panel of interests stacked over a
 * second image. The section supplies the framing and the two panels; the tiles and
 * pills come from `playgroundItem` documents so adding a sport is not a code change.
 *
 * The images are optional and the layout closes up without them — the prototype had
 * two empty `<image-slot>`s here, and a grid with two grey rectangles in it looks
 * broken in a way that a grid with one column fewer does not.
 */
export const playgroundSection = defineType({
  name: 'playgroundSection',
  title: 'Playground',
  type: 'object',
  icon: PlayIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'panels', title: 'Panels' },
    { name: 'media', title: 'Media' },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'localeString', group: 'content' }),
    defineField({ name: 'title', title: 'Section title', type: 'localeString', group: 'content' }),
    defineField({ name: 'lede', title: 'Intro paragraph', type: 'localeText', group: 'content' }),
    defineField({
      name: 'source',
      title: 'Which items?',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Automatic — every Playground item, in order', value: 'auto' },
          { title: 'Manual — pick and order them myself', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      group: 'content',
      hidden: ({ parent }) => parent?.source !== 'manual',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'playgroundItem' }] })],
    }),

    defineField({
      name: 'statement',
      title: 'Statement panel',
      description: 'The dark panel — the prototype used it for Markets. Leave the title empty to hide it.',
      type: 'object',
      group: 'panels',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'localeString' }),
        defineField({ name: 'body', title: 'Body', type: 'localeText' }),
      ],
    }),
    defineField({
      name: 'interestsLabel',
      title: 'Interests heading',
      description: 'Above the pills. The prototype said "Also me".',
      type: 'localeString',
      group: 'panels',
    }),
    defineField({
      name: 'note',
      title: 'Closing note',
      description: 'The small grey line under the pills.',
      type: 'localeText',
      group: 'panels',
    }),

    defineField({
      name: 'primaryImage',
      title: 'First image',
      description: 'Sits above the statement panel, 4:3.',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'secondaryImage',
      title: 'Second image',
      description: 'Sits below the interests panel, square.',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],

  preview: {
    select: { title: 'title.en', label: 'settings.label', hidden: 'settings.hidden' },
    prepare({ title, label, hidden }) {
      return {
        title: `${hidden ? '(hidden) ' : ''}Playground`,
        subtitle: label || title,
      }
    },
  },
})
