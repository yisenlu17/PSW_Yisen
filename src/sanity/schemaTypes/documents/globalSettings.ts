import { defineType, defineField, defineArrayMember } from 'sanity'
import { CogIcon } from '@sanity/icons/Cog'

/**
 * Maintained once, read everywhere.
 *
 * Anything that appears in more than one place — the email address in the hero, the
 * footer and the contact section; the résumé link in the nav and the closing CTA —
 * lives here so it is never updated in two places and half-updated in one.
 */
export const globalSettings = defineType({
  name: 'globalSettings',
  title: 'Global settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', group: 'identity' }),
    defineField({ name: 'nameLocal', title: 'Name (中文)', type: 'string', group: 'identity' }),
    defineField({
      name: 'profileImage',
      title: 'Profile image',
      type: 'image',
      group: 'identity',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'shortBio', title: 'Short bio', type: 'localeText', group: 'identity' }),
    defineField({ name: 'currentRole', title: 'Current role', type: 'localeString', group: 'identity' }),
    defineField({ name: 'currentLocation', title: 'Current location', type: 'localeString', group: 'identity' }),
    defineField({
      name: 'availability',
      title: 'Availability line',
      description: 'The utility bar at the very top, e.g. "Graduating January 2027 · open to product roles".',
      type: 'localeString',
      group: 'identity',
    }),

    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'contact',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'GitHub', value: 'github' },
                  { title: 'X / Twitter', value: 'x' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: '小红书', value: 'xiaohongshu' },
                  { title: '哔哩哔哩', value: 'bilibili' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Other', value: 'other' },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'label', title: 'Label override', type: 'string' }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'resume',
      title: 'Résumé (PDF)',
      description:
        'One PDF per language. A visitor reading the site in 中文 gets the Chinese file; upload only one and everybody gets that one.',
      type: 'localeFile',
      group: 'contact',
    }),

    defineField({
      name: 'seoTitle',
      title: 'Default SEO title',
      type: 'localeString',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Default SEO description',
      type: 'localeText',
      group: 'seo',
    }),
    defineField({
      name: 'ogImage',
      title: 'Default social share image',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      description:
        'The browser-tab icon. A square image, at least 512×512 — it gets scaled down to 32px, so anything with fine detail turns to mush.',
      type: 'image',
      group: 'seo',
      options: { accept: 'image/png,image/svg+xml' },
    }),
  ],

  preview: {
    prepare: () => ({ title: 'Global settings' }),
  },
})
