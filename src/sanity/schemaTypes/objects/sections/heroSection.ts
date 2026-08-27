import { defineType, defineField, defineArrayMember } from 'sanity'
import { HomeIcon } from '@sanity/icons/Home'

/**
 * The opening screen.
 *
 * The headline is split into two lines plus a rotating word because that is how the
 * animation works — the rotor swaps only the last word, so it has to be its own
 * field rather than something parsed out of a sentence.
 */
export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  icon: HomeIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'portrait', title: 'Portrait' },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      description: 'Small gold line above the headline.',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'headlineLine1',
      title: 'Headline — first line',
      type: 'localeString',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headlineLine2',
      title: 'Headline — second line (before the rotating word)',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'rotatingWords',
      title: 'Rotating words',
      description:
        'The gold word at the end of the headline cycles through these. Give it one word to hold it still.',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'localeString' })],
    }),
    defineField({
      name: 'lede',
      title: 'Intro paragraph',
      type: 'localeText',
      group: 'content',
    }),
    defineField({
      name: 'ctas',
      title: 'Buttons',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.max(2).warning('Two buttons is the most this layout holds well.'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'cta',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'localeString' }),
            defineField({
              name: 'href',
              title: 'Link',
              description: 'An anchor like #projects, or a full URL.',
              type: 'string',
            }),
            defineField({
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Gold — primary', value: 'gold' },
                  { title: 'Ghost — outline', value: 'ghost' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              initialValue: 'gold',
            }),
          ],
          preview: { select: { title: 'label.en', subtitle: 'href' } },
        }),
      ],
    }),
    defineField({
      name: 'metaItems',
      title: 'Meta strip',
      description: 'The small monospaced line under the buttons.',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'localeString' })],
      validation: (rule) => rule.max(4).warning('More than four wraps awkwardly on mobile.'),
    }),

    defineField({
      name: 'showPortrait',
      title: 'Show portrait',
      type: 'boolean',
      group: 'portrait',
      initialValue: true,
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait image',
      description:
        'Editorial crop, not a passport photo. Left empty, the Profile image from ' +
        'Global settings → Identity is used.',
      type: 'image',
      group: 'portrait',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.showPortrait === false,
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'portraitBadge',
      title: 'Portrait badge',
      description: 'The gold label pinned to the corner of the portrait.',
      type: 'localeString',
      group: 'portrait',
      hidden: ({ parent }) => parent?.showPortrait === false,
    }),

    defineField({
      name: 'rotateHeadlineWord',
      title: 'Animate the rotating word',
      type: 'boolean',
      group: 'settings',
      initialValue: true,
    }),
    defineField({
      name: 'settings',
      title: 'Section settings',
      type: 'sectionSettings',
      group: 'settings',
    }),
  ],

  preview: {
    select: {
      line1: 'headlineLine1.en',
      label: 'settings.label',
      hidden: 'settings.hidden',
      media: 'portrait',
    },
    prepare({ line1, label, hidden, media }) {
      return {
        title: `${hidden ? '(hidden) ' : ''}Hero`,
        subtitle: label || line1 || 'No headline yet',
        media,
      }
    },
  },
})
