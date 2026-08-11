import { defineType, defineField, defineArrayMember } from 'sanity'
import { ThLargeIcon } from '@sanity/icons/ThLarge'

/**
 * A grid of mixed-size tiles.
 *
 * Tiles carry a size, not a position. Letting an editor place things on a grid is
 * how a bento layout turns into holes and orphans at the wrong breakpoint — sizes
 * flow, coordinates do not. Each tile can be text, an image, a statistic or a link,
 * and the grid arranges whatever it is given.
 */
export const bentoGridSection = defineType({
  name: 'bentoGridSection',
  title: 'Bento grid',
  type: 'object',
  icon: ThLargeIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'localeString', group: 'content' }),
    defineField({ name: 'title', title: 'Title', type: 'localeString', group: 'content' }),
    defineField({ name: 'lede', title: 'Intro paragraph', type: 'localeText', group: 'content' }),
    defineField({
      name: 'tiles',
      title: 'Tiles',
      description: 'Drag to reorder. Sizes flow into the grid; there are no coordinates to get wrong.',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'bentoTile',
          fields: [
            defineField({
              name: 'size',
              title: 'Size',
              type: 'string',
              options: {
                list: [
                  { title: 'Small — 1×1', value: 'sm' },
                  { title: 'Wide — 2×1', value: 'wide' },
                  { title: 'Tall — 1×2', value: 'tall' },
                  { title: 'Large — 2×2', value: 'lg' },
                ],
                layout: 'dropdown',
              },
              initialValue: 'sm',
            }),
            defineField({
              name: 'tone',
              title: 'Tone',
              type: 'string',
              options: {
                list: [
                  { title: 'Paper', value: 'paper' },
                  { title: 'Cream', value: 'cream' },
                  { title: 'Navy', value: 'navy' },
                  { title: 'Gold', value: 'gold' },
                ],
                layout: 'dropdown',
              },
              initialValue: 'paper',
            }),
            defineField({ name: 'kicker', title: 'Kicker', type: 'localeString' }),
            defineField({ name: 'title', title: 'Title', type: 'localeString' }),
            defineField({ name: 'body', title: 'Body', type: 'localeText' }),
            defineField({
              name: 'stat',
              title: 'Statistic',
              description: 'Rendered large. Use instead of a title when the number is the point.',
              type: 'string',
            }),
            defineField({
              name: 'image',
              title: 'Image',
              description: 'Fills the tile behind the text when present.',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
            defineField({
              name: 'href',
              title: 'Link',
              description: 'Makes the whole tile clickable.',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'title.en', stat: 'stat', size: 'size', media: 'image' },
            prepare: ({ title, stat, size, media }) => ({
              title: title || stat || 'Tile',
              subtitle: size,
              media,
            }),
          },
        }),
      ],
    }),
    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],
  preview: {
    select: { title: 'title.en', tiles: 'tiles', hidden: 'settings.hidden' },
    prepare: ({ title, tiles, hidden }) => ({
      title: `${hidden ? '(hidden) ' : ''}Bento grid`,
      subtitle: [title, `${tiles?.length ?? 0} tiles`].filter(Boolean).join(' · '),
    }),
  },
})
