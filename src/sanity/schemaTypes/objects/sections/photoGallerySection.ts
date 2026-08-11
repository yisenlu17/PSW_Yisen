import { defineType, defineField, defineArrayMember } from 'sanity'
import { ImagesIcon } from '@sanity/icons/Images'

/**
 * A set of photographs.
 *
 * Alt text is required rather than encouraged: a gallery is the one place a page
 * turns entirely to images, and a screen reader meeting eight unlabelled ones gets
 * nothing at all. The layouts are fixed shapes — the editor picks which, never the
 * column count or the gap.
 */
export const photoGallerySection = defineType({
  name: 'photoGallerySection',
  title: 'Photo gallery',
  type: 'object',
  icon: ImagesIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'localeString', group: 'content' }),
    defineField({ name: 'title', title: 'Title', type: 'localeString', group: 'content' }),
    defineField({ name: 'lede', title: 'Intro paragraph', type: 'localeText', group: 'content' }),
    defineField({
      name: 'photos',
      title: 'Photographs',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              description: 'What is in the photograph, for anyone who cannot see it.',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'caption', title: 'Caption', type: 'localeString' }),
          ],
        }),
      ],
      validation: (rule) => rule.min(2).warning('A gallery of one is just an image.'),
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Grid — equal tiles', value: 'grid' },
          { title: 'Masonry — natural heights', value: 'masonry' },
          { title: 'Filmstrip — horizontal scroll', value: 'filmstrip' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'grid',
    }),
    defineField({ name: 'settings', title: 'Section settings', type: 'sectionSettings', group: 'settings' }),
  ],
  preview: {
    select: { title: 'title.en', photos: 'photos', hidden: 'settings.hidden', media: 'photos.0' },
    prepare: ({ title, photos, hidden, media }) => ({
      title: `${hidden ? '(hidden) ' : ''}Photo gallery`,
      subtitle: [title, `${photos?.length ?? 0} photos`].filter(Boolean).join(' · '),
      media,
    }),
  },
})
