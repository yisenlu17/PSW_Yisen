import { defineType, defineField, defineArrayMember } from 'sanity'
import { DocumentIcon } from '@sanity/icons/Document'

/**
 * A page is an ordered list of sections and nothing else.
 *
 * Reordering, hiding, duplicating and deleting sections are all things a Sanity
 * array already does — dragging a block in Presentation moves it here. New section
 * types become available by adding them to `of` below, which is the one line of code
 * a new premium component costs.
 */
export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'sections', title: 'Sections', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      description: 'Only ever shown in the studio.',
      type: 'string',
      group: 'sections',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      description: 'Use "/" for the homepage.',
      type: 'slug',
      group: 'sections',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      description: 'Drag to reorder. Each section carries its own settings.',
      type: 'array',
      group: 'sections',
      of: [
        defineArrayMember({ type: 'heroSection' }),
        defineArrayMember({ type: 'editorialIntroSection' }),
        defineArrayMember({ type: 'statsSection' }),
        defineArrayMember({ type: 'experienceSection' }),
        defineArrayMember({ type: 'currentlySection' }),
        defineArrayMember({ type: 'ctaSection' }),
      ],
      options: { insertMenu: { filter: true, views: [{ name: 'grid' }, { name: 'list' }] } },
    }),

    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      description: 'Falls back to the global default when empty.',
      type: 'localeString',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'localeText',
      group: 'seo',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
    }),
  ],

  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare({ title, slug }) {
      return { title: title ?? 'Untitled', subtitle: slug === '/' ? '/ (homepage)' : `/${slug ?? ''}` }
    },
  },
})
