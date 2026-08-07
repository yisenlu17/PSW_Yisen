import { defineType, defineField, defineArrayMember } from 'sanity'
import { MenuIcon } from '@sanity/icons/Menu'

/**
 * Menu structure only.
 *
 * Labels, order, visibility and targets are content. The sticky behaviour, the gold
 * underline, the mobile drawer and the scroll states are not — they stay in the
 * header component where they can be tested.
 */
export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Menu items',
      description: 'Drag to reorder.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navItem',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'localeString',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Link',
              description: 'An anchor like #experience, a path like /projects, or a full URL.',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'external',
              title: 'Open in a new tab',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'hidden',
              title: 'Hide',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'emphasis',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Plain link', value: 'plain' },
                  { title: 'Button — gold', value: 'gold' },
                  { title: 'Button — navy', value: 'navy' },
                ],
                layout: 'dropdown',
              },
              initialValue: 'plain',
            }),
          ],
          preview: {
            select: { title: 'label.en', subtitle: 'href', hidden: 'hidden' },
            prepare: ({ title, subtitle, hidden }) => ({
              title: `${hidden ? '(hidden) ' : ''}${title ?? 'Untitled'}`,
              subtitle,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'footerStatement',
      title: 'Footer statement',
      type: 'localeText',
    }),
    defineField({
      name: 'footerNote',
      title: 'Footer note',
      description: 'The small line under the footer columns.',
      type: 'localeString',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright',
      type: 'localeString',
    }),
  ],
  preview: { prepare: () => ({ title: 'Navigation & footer' }) },
})
