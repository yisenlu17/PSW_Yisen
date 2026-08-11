import { defineType, defineField } from 'sanity'
import { PlayIcon } from '@sanity/icons/Play'

/**
 * One video, with something written next to or under it.
 */
export const videoFeatureSection = defineType({
  name: 'videoFeatureSection',
  title: 'Video feature',
  type: 'object',
  icon: PlayIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'localeString', group: 'content' }),
    defineField({ name: 'title', title: 'Title', type: 'localeString', group: 'content' }),
    defineField({ name: 'body', title: 'Body', type: 'localeText', group: 'content' }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'videoEmbed',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Full width', value: 'full' },
          { title: 'Video beside the text', value: 'split' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'full',
    }),
    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],
  preview: {
    select: { title: 'title.en', hidden: 'settings.hidden', media: 'video.poster' },
    prepare: ({ title, hidden, media }) => ({
      title: `${hidden ? '(hidden) ' : ''}Video feature`,
      subtitle: title,
      media,
    }),
  },
})
