import { defineType, defineField, defineArrayMember } from 'sanity'
import { ClockIcon } from '@sanity/icons/Clock'

/**
 * "What I'm working on now" — a two-column list of topic and one-line answer.
 *
 * `updatedLabel` is authored rather than derived from the document's edit time: a
 * typo fix should not make the section claim it was rethought this month.
 */
export const currentlySection = defineType({
  name: 'currentlySection',
  title: 'Currently',
  type: 'object',
  icon: ClockIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'localeString', group: 'content' }),
    defineField({ name: 'title', title: 'Title', type: 'localeString', group: 'content' }),
    defineField({
      name: 'updatedLabel',
      title: 'Updated label',
      description: 'e.g. "Updated August 2026". Written by hand so small edits do not bump it.',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'currentlyItem',
          fields: [
            defineField({ name: 'label', title: 'Topic', type: 'localeString' }),
            defineField({ name: 'body', title: 'One line', type: 'localeText' }),
          ],
          preview: { select: { title: 'label.en', subtitle: 'body.en' } },
        }),
      ],
    }),
    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],
  preview: {
    select: { title: 'title.en', label: 'settings.label', hidden: 'settings.hidden' },
    prepare: ({ title, label, hidden }) => ({
      title: `${hidden ? '(hidden) ' : ''}Currently`,
      subtitle: label || title,
    }),
  },
})
