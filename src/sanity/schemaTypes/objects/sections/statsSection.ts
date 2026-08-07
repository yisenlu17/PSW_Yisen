import { defineType, defineField, defineArrayMember } from 'sanity'
import { BarChartIcon } from '@sanity/icons/BarChart'

/**
 * Numbers with a source attached.
 *
 * `countTo` is separate from the displayed value because "20,000+" is not a number
 * a counter can animate towards. Leaving it empty simply renders the value without
 * the count-up, which is the right behaviour for something like "2 days → 2 hours".
 */
export const statsSection = defineType({
  name: 'statsSection',
  title: 'Stats',
  type: 'object',
  icon: BarChartIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'localeString', group: 'content' }),
    defineField({ name: 'title', title: 'Title', type: 'localeString', group: 'content' }),
    defineField({ name: 'note', title: 'Note', type: 'localeText', group: 'content' }),

    defineField({
      name: 'feature',
      title: 'Feature stat',
      description: 'The wide dark panel. Leave empty to show only the grid.',
      type: 'object',
      group: 'content',
      options: { collapsible: true },
      fields: [
        defineField({ name: 'source', title: 'Source label', type: 'localeString' }),
        defineField({
          name: 'value',
          title: 'Value',
          description: 'Wrap words in *asterisks* to render them in gold, e.g. "2 *days* → 2 *hours*".',
          type: 'localeString',
        }),
        defineField({ name: 'description', title: 'Description', type: 'localeText' }),
      ],
    }),

    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({
              name: 'value',
              title: 'Displayed value',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'suffix',
              title: 'Suffix',
              description: 'Rendered in gold after the value, e.g. "+".',
              type: 'string',
            }),
            defineField({
              name: 'countTo',
              title: 'Animate up to',
              description: 'Optional. A plain number for the count-up animation.',
              type: 'number',
            }),
            defineField({ name: 'label', title: 'Label', type: 'localeString' }),
            defineField({
              name: 'source',
              title: 'Source',
              description: 'Where the number comes from, e.g. "Orfeostory, 2026".',
              type: 'localeString',
            }),
          ],
          preview: { select: { title: 'value', subtitle: 'label.en' } },
        }),
      ],
    }),
    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],
  preview: {
    select: { title: 'title.en', label: 'settings.label', hidden: 'settings.hidden' },
    prepare: ({ title, label, hidden }) => ({
      title: `${hidden ? '(hidden) ' : ''}Stats`,
      subtitle: label || title,
    }),
  },
})
