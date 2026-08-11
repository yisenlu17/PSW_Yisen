import { defineType, defineField } from 'sanity'
import { PlayIcon } from '@sanity/icons/Play'

/**
 * One video, from wherever it lives.
 *
 * Editors paste the URL they already have — the watch page, the share link, the
 * one with a timestamp on it — rather than hunting for an embed code, and the
 * renderer works the ID out. Uploading is the third option for footage with no
 * home on a platform, though a 100MB upload is worse for everyone than a link.
 */
export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: 'Video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'YouTube', value: 'youtube' },
          { title: 'Vimeo', value: 'vimeo' },
          { title: 'Upload a file', value: 'file' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'youtube',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Video URL',
      description: 'Paste the normal link — youtube.com/watch?v=…, youtu.be/…, or vimeo.com/…',
      type: 'url',
      hidden: ({ parent }) => parent?.source === 'file',
      validation: (rule) =>
        rule.custom((value, context) => {
          const source = (context.parent as { source?: string } | undefined)?.source
          if (source === 'file') return true
          if (!value) return 'A video URL is required.'
          if (source === 'youtube' && !/youtube\.com|youtu\.be/.test(value)) {
            return 'That does not look like a YouTube link.'
          }
          if (source === 'vimeo' && !/vimeo\.com/.test(value)) {
            return 'That does not look like a Vimeo link.'
          }
          return true
        }),
    }),
    defineField({
      name: 'file',
      title: 'Video file',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.source !== 'file',
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      description:
        'Shown before the video loads. Without one, an uploaded video shows a black rectangle and a YouTube video pulls its own thumbnail.',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Used as the accessible name of the player.',
      type: 'localeString',
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'localeString' }),
  ],
  preview: {
    select: { source: 'source', url: 'url', title: 'title.en', media: 'poster' },
    prepare: ({ source, url, title, media }) => ({
      title: title || 'Video',
      subtitle: source === 'file' ? 'Uploaded file' : url,
      media,
    }),
  },
})
