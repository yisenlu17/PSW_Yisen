import { defineType, defineField, defineArrayMember } from 'sanity'
import { BlockquoteIcon } from '@sanity/icons/Blockquote'

/**
 * A narrative section: a claim, then the steps that back it up.
 *
 * The steps are numbered by position rather than by an authored number, so
 * reordering them renumbers them and there is no way to end up with two "03"s.
 */
export const editorialIntroSection = defineType({
  name: 'editorialIntroSection',
  title: 'Editorial intro',
  type: 'object',
  icon: BlockquoteIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'portrait', title: 'Portrait' },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'localeString', group: 'content' }),
    defineField({ name: 'title', title: 'Title', type: 'localeString', group: 'content' }),
    defineField({ name: 'lede', title: 'Intro paragraph', type: 'localeText', group: 'content' }),
    defineField({
      name: 'note',
      title: 'Note',
      description: 'The smaller, muted line under the intro.',
      type: 'localeText',
      group: 'content',
    }),
    defineField({
      name: 'showPortrait',
      title: 'Show the portrait',
      description: 'The photo sits beside the intro, on the right.',
      type: 'boolean',
      group: 'portrait',
      initialValue: true,
    }),
    defineField({
      name: 'portrait',
      title: 'A different photo',
      description:
        'Leave this empty and the Profile image from Global settings → Identity is used — ' +
        'which is the one to change when the photo is out of date, because the masthead ' +
        'reads it too. Upload here only to give this one section a different picture.',
      type: 'image',
      group: 'portrait',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.showPortrait === false,
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'portraitCaption',
      title: 'Caption',
      description: 'The small line under the photo. Optional.',
      type: 'localeString',
      group: 'portrait',
      hidden: ({ parent }) => parent?.showPortrait === false,
    }),

    defineField({
      name: 'steps',
      title: 'Steps',
      description: 'Numbered automatically in order. The last one renders dark.',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'localeString' }),
            defineField({ name: 'body', title: 'Body', type: 'localeText' }),
          ],
          preview: { select: { title: 'title.en', subtitle: 'body.en' } },
        }),
      ],
      validation: (rule) => rule.max(6).warning('More than six steps stop fitting on one row.'),
    }),
    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],
  preview: {
    select: { title: 'title.en', label: 'settings.label', hidden: 'settings.hidden' },
    prepare: ({ title, label, hidden }) => ({
      title: `${hidden ? '(hidden) ' : ''}Editorial intro`,
      subtitle: label || title,
    }),
  },
})
