import { defineType, defineField, defineArrayMember } from 'sanity'
import { RocketIcon } from '@sanity/icons/Rocket'

import { slugFrom, slugRule } from '../slugOptions'

/**
 * What a write-up can contain, defined once and used by both languages.
 *
 * Headings below h3 have no design in this system, and a colour picker on text would
 * let an editor undo the palette one paragraph at a time — so the list is short on
 * purpose. `flowSteps` is the exception that earns its place: every case study here
 * has a chain in it, and typing one as a sentence full of arrows wraps badly.
 */
const WRITE_UP = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Paragraph', value: 'normal' },
      { title: 'Heading', value: 'h3' },
      { title: 'Quote', value: 'blockquote' },
    ],
    lists: [
      { title: 'Bulleted', value: 'bullet' },
      { title: 'Numbered', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Bold', value: 'strong' },
        { title: 'Italic', value: 'em' },
        { title: 'Code', value: 'code' },
      ],
    },
  }),
  defineArrayMember({ type: 'flowSteps' }),
  defineArrayMember({
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      defineField({ name: 'caption', title: 'Caption', type: 'localeString' }),
    ],
  }),
]

/**
 * One project, entered once.
 *
 * This is the document an interviewer actually reads, so it carries two depths at
 * the same time: the card fields (`tagline`, `summary`, `tags`) that appear in the
 * Projects section, and the case-study fields (`problem`, `approach`, `outcome`,
 * `metrics`, `gallery`) that only exist on `/projects/<slug>`. Filling in the first
 * group is enough to publish; the second turns a card into a detail page.
 *
 * `status` and `role` are closed lists rather than free text. "Shipped" meaning the
 * same thing on every card is worth more than the ability to invent a new word for
 * it, and it lets the card render a state chip the code owns.
 */
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: RocketIcon,
  groups: [
    { name: 'essentials', title: 'Essentials', default: true },
    { name: 'card', title: 'Card' },
    { name: 'story', title: 'Case study' },
    { name: 'evidence', title: 'Evidence' },
    { name: 'media', title: 'Media' },
    { name: 'links', title: 'Links & related' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    /* ---------------------------------------------------------- essentials */
    defineField({
      name: 'title',
      title: 'Project name',
      description: 'Shown exactly as typed, in either language — 我是懂球王 stays 我是懂球王.',
      type: 'string',
      group: 'essentials',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'titleLocal',
      title: 'Project name (中文)',
      description:
        'Only when the project genuinely has a second name. A name that is already Chinese, or already English, belongs in the field above and nowhere else.',
      type: 'string',
      group: 'essentials',
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      description: 'Becomes /projects/<slug>. Changing it breaks any link already shared.',
      type: 'slug',
      group: 'essentials',
      options: slugFrom('title'),
      validation: (rule) => slugRule(rule),
    }),
    defineField({
      name: 'category',
      title: 'Category label',
      description: 'The small gold line above the name, e.g. "Product · Self-initiated · 2026".',
      type: 'localeString',
      group: 'essentials',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      description: 'Renders as a state chip. Live and In use both read as working software.',
      type: 'string',
      group: 'essentials',
      options: {
        list: [
          { title: 'Live — anyone can use it', value: 'live' },
          { title: 'In daily use — a real user depends on it', value: 'inUse' },
          { title: 'Launching soon — finished, in final testing', value: 'comingSoon' },
          { title: 'In progress — being built now', value: 'building' },
          { title: 'In validation — testing the need before building', value: 'validating' },
          { title: 'Prototype — proves one idea', value: 'prototype' },
          { title: 'Archived — finished or stopped', value: 'archived' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'building',
    }),
    defineField({
      name: 'role',
      title: 'My role',
      type: 'string',
      group: 'essentials',
      options: {
        list: [
          { title: 'Solo — planned and built it alone', value: 'solo' },
          { title: 'Led — set direction, worked with others', value: 'lead' },
          { title: 'Contributed — one part of a team', value: 'contributor' },
        ],
        layout: 'radio',
      },
      initialValue: 'solo',
    }),
    defineField({
      name: 'roleDetail',
      title: 'Role, in your words',
      description:
        'The hats you actually wore — Product Owner, Product Design, AI-assisted Development. Shown as chips on the detail page, replacing the Solo/Led chip above. Three is plenty.',
      type: 'array',
      group: 'essentials',
      of: [defineArrayMember({ type: 'localeString' })],
    }),
    defineField({
      name: 'startDate',
      title: 'Started',
      type: 'date',
      group: 'essentials',
      options: { dateFormat: 'YYYY-MM' },
    }),
    defineField({
      name: 'endDate',
      title: 'Finished',
      description: 'Leave empty while it is still running.',
      type: 'date',
      group: 'essentials',
      options: { dateFormat: 'YYYY-MM' },
      validation: (rule) =>
        rule.min(rule.valueOfField('startDate')).warning('Finished is before started.'),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      description:
        'Featured projects render as full cards with an image. The rest fall into the "Also running" strip underneath.',
      type: 'boolean',
      group: 'essentials',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Manual order',
      description: 'Lower numbers first. Leave empty to sort by start date, newest first.',
      type: 'number',
      group: 'essentials',
    }),

    /* ---------------------------------------------------------------- card */
    defineField({
      name: 'tagline',
      title: 'One-line description',
      description:
        'The mono line under the name — what it is, in one breath. e.g. "NBA prediction platform · planned and built solo".',
      type: 'localeString',
      group: 'card',
    }),
    defineField({
      name: 'summary',
      title: 'Card paragraph',
      description: 'Two or three sentences. This is the whole pitch on the Projects page.',
      type: 'localeText',
      group: 'card',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      description: 'The pills on the card. Three or four; more reads as noise.',
      type: 'array',
      group: 'card',
      of: [defineArrayMember({ type: 'localeString' })],
    }),
    defineField({
      name: 'highlight',
      title: 'Headline metric',
      description: 'One number worth leading with, e.g. "First real user".',
      type: 'localeString',
      group: 'card',
    }),

    /* --------------------------------------------------------------- story */
    defineField({
      name: 'problem',
      title: 'The problem',
      description: 'What was actually wrong, before you touched it.',
      type: 'localeText',
      group: 'story',
    }),
    defineField({
      name: 'approach',
      title: 'What I did',
      type: 'localeText',
      group: 'story',
    }),
    defineField({
      name: 'outcome',
      title: 'What happened',
      description: 'Including when it did not work. That answer interviews well.',
      type: 'localeText',
      group: 'story',
    }),
    defineField({
      name: 'body',
      title: 'Full write-up',
      description: 'Long form, detail page only. Leave empty and the page shows the three fields above.',
      type: 'array',
      group: 'story',
      of: WRITE_UP,
    }),
    defineField({
      name: 'bodyZh',
      title: 'Full write-up (中文)',
      description: 'Optional. Empty falls back to the English write-up, same as every other field.',
      type: 'array',
      group: 'story',
      of: WRITE_UP,
    }),

    /* ------------------------------------------------------------ evidence */
    defineField({
      name: 'metrics',
      title: 'Metrics',
      description: 'Numbers with something behind them. Shown as a row on the detail page.',
      type: 'array',
      group: 'evidence',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'projectMetric',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'localeString' }),
            defineField({ name: 'source', title: 'Source or date', type: 'localeString' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label.en' } },
        }),
      ],
    }),
    defineField({
      name: 'features',
      title: 'What it does',
      description: 'The functional list — fixtures, picks, points, leaderboard.',
      type: 'array',
      group: 'evidence',
      of: [defineArrayMember({ type: 'localeString' })],
    }),
    defineField({
      name: 'learnings',
      title: 'What I learned',
      type: 'array',
      group: 'evidence',
      of: [defineArrayMember({ type: 'localeString' })],
    }),
    defineField({
      name: 'stack',
      title: 'Built with',
      type: 'array',
      group: 'evidence',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),

    /* --------------------------------------------------------------- media */
    defineField({
      name: 'cover',
      title: 'Cover image',
      description:
        'Shown whole, in whatever shape it was captured — on the card and at the top of the detail page. A full-page screenshot is fine; nothing is cropped.',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      description: 'Screenshots, detail page only.',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'localeString' }),
          ],
        }),
      ],
    }),

    /* --------------------------------------------------------------- links */
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      group: 'links',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'projectLink',
          fields: [
            defineField({
              name: 'kind',
              title: 'Kind',
              type: 'string',
              options: {
                list: [
                  { title: 'Live site', value: 'live' },
                  { title: 'Source code', value: 'code' },
                  { title: 'Write-up', value: 'writeup' },
                  { title: 'Video', value: 'video' },
                  { title: 'Other', value: 'other' },
                ],
              },
              initialValue: 'live',
            }),
            defineField({ name: 'label', title: 'Label', type: 'localeString' }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'label.en', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'handles',
      title: 'Accounts',
      description:
        'An account named by its ID rather than by an address — a 抖音号 is how somebody finds the account in the app, and no web URL opens one reliably. Shown as text to copy, not as a link that would not work.',
      type: 'array',
      group: 'links',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'projectHandle',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: '抖音', value: 'douyin' },
                  { title: '小红书', value: 'xiaohongshu' },
                  { title: '哔哩哔哩', value: 'bilibili' },
                  { title: '微信公众号', value: 'wechat' },
                  { title: 'Other', value: 'other' },
                ],
              },
              initialValue: 'douyin',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'id',
              title: 'ID',
              description: 'As it is typed into the app’s search — 抖音号 94617971040.',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label override',
              description: 'Only when the platform’s own name is not what should be read.',
              type: 'localeString',
            }),
          ],
          preview: { select: { title: 'id', subtitle: 'platform' } },
        }),
      ],
    }),
    defineField({
      name: 'relatedExperience',
      title: 'Related role',
      description: 'If this came out of a job, point at it.',
      type: 'reference',
      group: 'links',
      to: [{ type: 'experience' }],
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Related projects',
      description: 'Shown at the foot of the detail page. A project cannot be related to itself.',
      type: 'array',
      group: 'links',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'project' }],
          // Without this an editor can pick the project they are editing, and the
          // detail page ends up linking back to itself.
          options: {
            filter: ({ document }) => ({
              filter: '_id != $self && _id != $draft',
              params: {
                self: document._id.replace(/^drafts\./, ''),
                draft: `drafts.${document._id.replace(/^drafts\./, '')}`,
              },
            }),
          },
        }),
      ],
    }),

    /* ----------------------------------------------------------------- seo */
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'localeString', group: 'seo' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'localeText', group: 'seo' }),
  ],

  orderings: [
    { title: 'Newest first', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] },
    { title: 'Manual order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],

  preview: {
    select: {
      title: 'title',
      tagline: 'tagline.en',
      status: 'status',
      featured: 'featured',
      media: 'cover',
    },
    prepare({ title, tagline, status, featured, media }) {
      const STATUS: Record<string, string> = {
        live: 'Live',
        inUse: 'In daily use',
        building: 'In progress',
        prototype: 'Prototype',
        archived: 'Archived',
      }
      return {
        title: `${featured ? '★ ' : ''}${title ?? 'Untitled'}`,
        subtitle: [status ? STATUS[status] : null, tagline].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
