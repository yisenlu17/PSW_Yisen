import { defineType, defineField, defineArrayMember } from 'sanity'
import { CaseIcon } from '@sanity/icons/Case'

/**
 * Pulls Experience documents onto a page.
 *
 * The section holds no role data of its own — it points at `experience` documents so
 * a job is edited in one place and updates everywhere it appears. `source: auto` is
 * the default because it means adding an internship is a single action: create the
 * document, tick Featured, done. Manual picking exists for when the homepage should
 * say something different from "the most recent ones".
 */
export const experienceSection = defineType({
  name: 'experienceSection',
  title: 'Experience',
  type: 'object',
  icon: CaseIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'title',
      title: 'Section title',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'lede',
      title: 'Intro paragraph',
      type: 'localeText',
      group: 'content',
    }),
    defineField({
      name: 'source',
      title: 'Which roles?',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Automatic — featured roles as cards, the rest as a list', value: 'auto' },
          { title: 'Manual — pick and order them myself', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
    }),
    defineField({
      name: 'roles',
      title: 'Roles',
      type: 'array',
      group: 'content',
      hidden: ({ parent }) => parent?.source !== 'manual',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'experience' }],
        }),
      ],
    }),
    defineField({
      name: 'limit',
      title: 'Maximum roles to show',
      description: 'Leave empty to show all of them.',
      type: 'number',
      group: 'content',
      hidden: ({ parent }) => parent?.source !== 'auto',
      validation: (rule) => rule.min(1).integer(),
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Cards + compact list', value: 'cardsAndList' },
          { title: 'Cards only', value: 'cards' },
          { title: 'Timeline', value: 'timeline' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'cardsAndList',
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
      title: 'title.en',
      label: 'settings.label',
      hidden: 'settings.hidden',
      variant: 'variant',
      source: 'source',
    },
    prepare({ title, label, hidden, variant, source }) {
      return {
        title: `${hidden ? '(hidden) ' : ''}Experience`,
        subtitle: [label || title, variant, source].filter(Boolean).join(' · '),
      }
    },
  },
})
