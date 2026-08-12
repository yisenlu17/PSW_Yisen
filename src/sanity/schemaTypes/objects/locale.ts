import { defineType, defineField } from 'sanity'

/**
 * Field-level bilingual values.
 *
 * The site ships in English and Chinese from the same document, so every piece of
 * author-facing copy is a { en, zh } pair rather than a bare string. Two languages
 * is few enough that document-level translation (a whole parallel document tree)
 * would cost more than it returns — the editor wants both versions side by side.
 *
 * `en` is the fallback: if `zh` is empty the site renders English rather than a gap.
 */

export const LANGUAGES = [
  { id: 'en', title: 'English' },
  { id: 'zh', title: '中文' },
] as const

export type LanguageId = (typeof LANGUAGES)[number]['id']

export const localeString = defineType({
  name: 'localeString',
  title: 'Text',
  type: 'object',
  options: { columns: 2 },
  fields: LANGUAGES.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'string',
    })
  ),
})

/**
 * One file per language, for the things that exist twice.
 *
 * The résumé is the only such thing today, which is why the picker is scoped to PDFs.
 * A second use with different formats is the moment to lift `accept` out of here and
 * make it per-field — not before.
 *
 * Neither language is required: a résumé uploaded in one language is served to
 * everyone, which is better than a download button that does nothing for half the
 * visitors.
 */
export const localeFile = defineType({
  name: 'localeFile',
  title: 'File per language',
  type: 'object',
  options: { columns: 2 },
  fields: LANGUAGES.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'file',
      options: { accept: '.pdf' },
    })
  ),
})

export const localeText = defineType({
  name: 'localeText',
  title: 'Paragraph',
  type: 'object',
  fields: LANGUAGES.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'text',
      rows: 4,
    })
  ),
})
