import { defineType, defineField, defineArrayMember } from 'sanity'
import { RocketIcon } from '@sanity/icons/Rocket'

/**
 * Pulls Project documents onto a page.
 *
 * Same contract as the Experience section: the section owns the framing, the
 * documents own the projects. Featured projects become full alternating cards;
 * everything else collapses into the "Also running" strip, which is how the
 * prototype separated the three real products from the accounts and the student
 * venture without giving them equal weight.
 */
export const projectsSection = defineType({
  name: 'projectsSection',
  title: 'Projects',
  type: 'object',
  icon: RocketIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'localeString', group: 'content' }),
    defineField({ name: 'title', title: 'Section title', type: 'localeString', group: 'content' }),
    defineField({ name: 'lede', title: 'Intro paragraph', type: 'localeText', group: 'content' }),
    defineField({
      name: 'source',
      title: 'Which projects?',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Automatic — featured as cards, the rest as "Also running"', value: 'auto' },
          { title: 'Manual — pick and order them myself', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      group: 'content',
      hidden: ({ parent }) => parent?.source !== 'manual',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'project' }] })],
    }),
    defineField({
      name: 'limit',
      title: 'Maximum cards to show',
      description: 'Leave empty to show all of them. Does not affect "Also running".',
      type: 'number',
      group: 'content',
      hidden: ({ parent }) => parent?.source !== 'auto',
      validation: (rule) => rule.min(1).integer(),
    }),
    defineField({
      name: 'compact',
      title: 'Compact cards',
      description:
        'Drops the full-width image cards and the "Also running" strip for a row of one-liners — for a homepage that points at /projects rather than repeating it.',
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),
    defineField({
      name: 'alsoLabel',
      title: '"Also running" heading',
      hidden: ({ parent }) => parent?.compact === true,
      description: 'The label above the smaller projects. Leave empty to hide that strip entirely.',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'linkToDetail',
      title: 'Link cards to their detail page',
      description:
        'Off turns the cards into plain text — useful on a page that is only meant to tease.',
      type: 'boolean',
      group: 'content',
      initialValue: true,
    }),
    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],

  preview: {
    select: {
      title: 'title.en',
      label: 'settings.label',
      hidden: 'settings.hidden',
      source: 'source',
    },
    prepare({ title, label, hidden, source }) {
      return {
        title: `${hidden ? '(hidden) ' : ''}Projects`,
        subtitle: [label || title, source].filter(Boolean).join(' · '),
      }
    },
  },
})
