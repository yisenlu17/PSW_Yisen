import { defineType, defineField, defineArrayMember } from 'sanity'
import { CaseIcon } from '@sanity/icons/Case'

/**
 * One role, entered once.
 *
 * The same document feeds the homepage card, the experience detail page and the
 * résumé, so nothing here is written twice. Fields are ordered the way someone
 * actually fills them in — identity, then timeline, then the story — and grouped
 * so the "add an internship" path stays short: everything outside `essentials`
 * is optional.
 *
 * Dates are real dates, not prose. The original site hand-wrote "Jul 2026 — Present"
 * and "2026 年 7 月 — 至今" as two separate strings, which is duplicated data that
 * drifts. Formatting a date for a locale is presentation, so the components do it.
 */
export const experience = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  icon: CaseIcon,
  groups: [
    { name: 'essentials', title: 'Essentials', default: true },
    { name: 'story', title: 'Story' },
    { name: 'evidence', title: 'Evidence' },
    { name: 'media', title: 'Media' },
  ],
  fields: [
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      group: 'essentials',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'essentials',
      options: { source: 'company', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'localeString',
      group: 'essentials',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category label',
      description: 'The small gold line above the company name, e.g. "Digital product · Singapore".',
      type: 'localeString',
      group: 'essentials',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'essentials',
    }),
    defineField({
      name: 'logo',
      title: 'Company logo',
      type: 'image',
      group: 'essentials',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the logo for screen readers and search engines.',
        }),
      ],
    }),
    defineField({
      name: 'startDate',
      title: 'Start date',
      type: 'date',
      group: 'essentials',
      options: { dateFormat: 'YYYY-MM' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End date',
      description: 'Leave empty if this is your current role.',
      type: 'date',
      group: 'essentials',
      options: { dateFormat: 'YYYY-MM' },
      validation: (rule) =>
        rule.min(rule.valueOfField('startDate')).warning('End date is before the start date.'),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      description:
        'Featured roles render as full cards. The rest fall into the compact list underneath.',
      type: 'boolean',
      group: 'essentials',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Manual order',
      description: 'Lower numbers first. Leave empty to sort by start date, newest first.',
      type: 'number',
      group: 'essentials',
    }),

    defineField({
      name: 'summary',
      title: 'Short description',
      description: 'The first paragraph on the card. Two or three sentences.',
      type: 'localeText',
      group: 'story',
    }),
    defineField({
      name: 'secondary',
      title: 'Second paragraph',
      description: 'Optional follow-up paragraph on the card.',
      type: 'localeText',
      group: 'story',
    }),
    defineField({
      name: 'fullStory',
      title: 'Full story',
      description: 'Long form, used on the detail page only.',
      type: 'array',
      group: 'story',
      of: [defineArrayMember({ type: 'block' })],
    }),

    defineField({
      name: 'highlight',
      title: 'Headline metric',
      description: 'The pill on the card, e.g. "6 projects in parallel" or "2 DAYS → 2 HOURS".',
      type: 'localeString',
      group: 'evidence',
    }),
    defineField({
      name: 'responsibilities',
      title: 'Responsibilities',
      type: 'array',
      group: 'evidence',
      of: [defineArrayMember({ type: 'localeString' })],
    }),
    defineField({
      name: 'problemsSolved',
      title: 'Problems solved',
      type: 'array',
      group: 'evidence',
      of: [defineArrayMember({ type: 'localeString' })],
    }),
    defineField({
      name: 'metrics',
      title: 'Metrics',
      description: 'Numbers with a company name attached to them.',
      type: 'array',
      group: 'evidence',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'metric',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'localeString' }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label.en' },
          },
        }),
      ],
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      group: 'evidence',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),

    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        }),
      ],
    }),
    defineField({
      name: 'documents',
      title: 'Documents',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({ type: 'file' })],
    }),
  ],

  orderings: [
    {
      title: 'Newest first',
      name: 'startDateDesc',
      by: [{ field: 'startDate', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title: 'company',
      role: 'role.en',
      start: 'startDate',
      end: 'endDate',
      featured: 'featured',
      media: 'logo',
    },
    prepare({ title, role, start, end, featured, media }) {
      const year = (d?: string) => (d ? d.slice(0, 4) : '')
      const span = start ? `${year(start)}–${end ? year(end) : 'now'}` : ''
      return {
        title: `${featured ? '★ ' : ''}${title ?? 'Untitled'}`,
        subtitle: [role, span].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
