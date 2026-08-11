import { defineType, defineField } from 'sanity'

/**
 * The only design controls an editor ever gets.
 *
 * Every option here is a closed list that maps to a CSS class the components own.
 * There is deliberately no free-text colour, spacing, or CSS field: the editor
 * decides *what* a section says and *whether/where* it appears, the code decides
 * how it looks. Adding a knob here is a design decision, not a content one — so it
 * happens in a pull request, not in the studio.
 */

export const THEMES = [
  { title: 'Light — white paper', value: 'light' },
  { title: 'Cream — warm alternate', value: 'cream' },
  { title: 'Dark — deep navy', value: 'dark' },
  { title: 'Accent — gold wash', value: 'accent' },
] as const

export const SPACING = [
  { title: 'Compact', value: 'compact' },
  { title: 'Normal', value: 'normal' },
  { title: 'Large', value: 'large' },
] as const

export const ANIMATION = [
  { title: 'Default', value: 'default' },
  { title: 'Reduced', value: 'reduced' },
  { title: 'None', value: 'none' },
] as const

export const ALIGNMENT = [
  { title: 'Left', value: 'left' },
  { title: 'Centre', value: 'center' },
] as const

export const IMAGE_POSITION = [
  { title: 'Image on the right', value: 'right' },
  { title: 'Image on the left', value: 'left' },
] as const

export const OVERLAY = [
  { title: 'Light — image stays bright', value: 'light' },
  { title: 'Medium', value: 'medium' },
  { title: 'Heavy — text stays readable over anything', value: 'heavy' },
] as const

export const sectionSettings = defineType({
  name: 'sectionSettings',
  title: 'Section settings',
  type: 'object',
  options: { collapsible: true, collapsed: true, columns: 2 },
  fields: [
    defineField({
      name: 'hidden',
      title: 'Hide this section',
      description: 'Keeps the content but removes the section from the live site.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'label',
      title: 'Section label',
      description: 'Internal name shown in the editor list. Never rendered on the site.',
      type: 'string',
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      description: 'Used by navigation links, e.g. "experience" makes this section reachable at /#experience.',
      type: 'string',
      validation: (rule) =>
        rule.regex(/^[a-z0-9-]*$/, {
          name: 'lowercase, numbers and hyphens only',
        }),
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      options: { list: [...THEMES], layout: 'dropdown' },
      initialValue: 'light',
    }),
    defineField({
      name: 'spacing',
      title: 'Vertical spacing',
      type: 'string',
      options: { list: [...SPACING], layout: 'dropdown' },
      initialValue: 'normal',
    }),
    defineField({
      name: 'align',
      title: 'Text alignment',
      type: 'string',
      options: { list: [...ALIGNMENT], layout: 'radio', direction: 'horizontal' },
      initialValue: 'left',
    }),
    defineField({
      name: 'animation',
      title: 'Animation',
      description: 'Reduced keeps fades but drops movement. None disables scroll reveals entirely.',
      type: 'string',
      options: { list: [...ANIMATION], layout: 'dropdown' },
      initialValue: 'default',
    }),
    defineField({
      name: 'imagePosition',
      title: 'Image position',
      description: 'Which side the image sits on, in sections that have one. Ignored elsewhere.',
      type: 'string',
      options: { list: [...IMAGE_POSITION], layout: 'radio', direction: 'horizontal' },
      initialValue: 'right',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background image',
      description: 'Sits behind the whole section. The theme still decides the text colour.',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'overlay',
      title: 'Background overlay',
      description:
        'How much the background is dimmed. Text sits on top of it, so this is what keeps a section readable over a busy photograph.',
      type: 'string',
      options: { list: [...OVERLAY], layout: 'dropdown' },
      initialValue: 'medium',
      hidden: ({ parent }) => !parent?.backgroundImage,
    }),
  ],
})
