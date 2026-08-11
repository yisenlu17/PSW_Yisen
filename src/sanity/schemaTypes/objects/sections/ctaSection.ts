import { defineType, defineField, defineArrayMember } from 'sanity'
import { EnvelopeIcon } from '@sanity/icons/Envelope'

/**
 * The closing call to action.
 *
 * Buttons name an *intent* — email me, download the résumé, open LinkedIn — and the
 * actual address is resolved from Global settings when the page renders. The
 * prototype hard-coded three buttons that all pointed at `#top` and a note reading
 * "[NEED CONTENT] PROFESSIONAL EMAIL · LINKEDIN URL"; wiring intent to one stored
 * value means a contact detail is changed in one place and can never go stale in
 * another.
 */
export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Closing CTA',
  type: 'object',
  icon: EnvelopeIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'localeString', group: 'content' }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'body', title: 'Body', type: 'localeText', group: 'content' }),
    defineField({
      name: 'actions',
      title: 'Buttons',
      description: 'Links come from Global settings — set the address there, once.',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'ctaAction',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'localeString' }),
            defineField({
              name: 'intent',
              title: 'Goes to',
              type: 'string',
              options: {
                list: [
                  { title: 'My email address', value: 'email' },
                  { title: 'My résumé PDF', value: 'resume' },
                  { title: 'A social profile', value: 'social' },
                  { title: 'A custom link', value: 'custom' },
                ],
              },
              initialValue: 'email',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'platform',
              title: 'Which profile',
              type: 'string',
              hidden: ({ parent }) => parent?.intent !== 'social',
              options: {
                list: [
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'GitHub', value: 'github' },
                  { title: 'X / Twitter', value: 'x' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: '小红书', value: 'xiaohongshu' },
                  { title: '哔哩哔哩', value: 'bilibili' },
                  { title: 'YouTube', value: 'youtube' },
                ],
              },
            }),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'string',
              hidden: ({ parent }) => parent?.intent !== 'custom',
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
              initialValue: 'ghost',
            }),
          ],
          preview: { select: { title: 'label.en', subtitle: 'intent' } },
        }),
      ],
    }),
    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],
  preview: {
    select: { title: 'title.en', label: 'settings.label', hidden: 'settings.hidden' },
    prepare: ({ title, label, hidden }) => ({
      title: `${hidden ? '(hidden) ' : ''}Closing CTA`,
      subtitle: label || title,
    }),
  },
})
