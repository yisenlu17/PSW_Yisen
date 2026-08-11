import { defineType, defineField } from 'sanity'
import { BlockquoteIcon } from '@sanity/icons/Blockquote'

/**
 * One sentence, given room.
 *
 * Deliberately holds a single quote rather than a carousel of them: a wall of
 * testimonials reads as filler, whereas one line with a name under it reads as
 * evidence. Length is capped for the same reason — past about 240 characters the
 * display type stops being a quote and becomes a paragraph in the wrong font.
 */
export const quoteSection = defineType({
  name: 'quoteSection',
  title: 'Quote',
  type: 'object',
  icon: BlockquoteIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'localeText',
      group: 'content',
      validation: (rule) =>
        rule.required().custom((value?: { en?: string; zh?: string }) => {
          const longest = Math.max(value?.en?.length ?? 0, value?.zh?.length ?? 0)
          return longest > 240 ? 'Over 240 characters stops reading as a quote.' : true
        }),
    }),
    defineField({
      name: 'attribution',
      title: 'Who said it',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'context',
      title: 'Context',
      description: 'Their role, the company, the year — whatever makes the name mean something.',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Centred — large display type', value: 'display' },
          { title: 'Beside a portrait', value: 'portrait' },
          { title: 'Pull quote — narrow, left-aligned', value: 'pull' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'display',
    }),
    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],
  preview: {
    select: { quote: 'quote.en', by: 'attribution.en', hidden: 'settings.hidden', media: 'portrait' },
    prepare: ({ quote, by, hidden, media }) => ({
      title: `${hidden ? '(hidden) ' : ''}Quote`,
      subtitle: [by, quote].filter(Boolean).join(' — '),
      media,
    }),
  },
})
