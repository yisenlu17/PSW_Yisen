import { stegaClean } from 'next-sanity'

import type { Locale, LocaleString, LocaleText } from './locale'
import type { urlFor } from '@/sanity/image'

/** A Sanity image as the components receive it — asset ref plus authored alt text. */
export type SanityImage = Parameters<typeof urlFor>[0] & {
  alt?: string | null
  caption?: LocaleString
}

/** The card-level shape, shared by the Projects section and every list of related work. */
export type ProjectCardData = {
  _id: string
  title?: string | null
  titleLocal?: string | null
  slug?: string | null
  category?: LocaleString
  status?: string | null
  role?: string | null
  startDate?: string | null
  endDate?: string | null
  featured?: boolean | null
  order?: number | null
  tagline?: LocaleString
  summary?: LocaleText
  tags?: LocaleString[] | null
  highlight?: LocaleString
  cover?: SanityImage | null
}

/**
 * Status and role are closed lists in the schema, so their wording lives here rather
 * than in the dataset. An editor picking "Live" gets the same two words in both
 * languages on every card, and translating them later is one edit rather than one
 * per project.
 */
const STATUS: Record<string, { en: string; zh: string }> = {
  live: { en: 'Live', zh: '已上线' },
  inUse: { en: 'In daily use', zh: '每天在用' },
  comingSoon: { en: 'Launching soon', zh: '即将上线' },
  building: { en: 'In development', zh: '开发中' },
  validating: { en: 'In validation', zh: '验证阶段' },
  prototype: { en: 'Prototype', zh: '原型' },
  archived: { en: 'Archived', zh: '已归档' },
}

const ROLE: Record<string, { en: string; zh: string }> = {
  solo: { en: 'Solo', zh: '独立完成' },
  lead: { en: 'Led', zh: '主导' },
  contributor: { en: 'Contributor', zh: '参与' },
}

const lookup =
  (table: Record<string, { en: string; zh: string }>) =>
  (value: string | null | undefined, locale: Locale): string => {
    const key = value ? stegaClean(value) : ''
    return table[key]?.[locale] ?? table[key]?.en ?? ''
  }

export const statusLabel = lookup(STATUS)
export const roleLabel = lookup(ROLE)

/**
 * Most project names are proper nouns and stay as typed — 我是懂球王 is 我是懂球王 in
 * both languages. `titleLocal` is for the few that really do have two names.
 */
export function projectTitle(
  project: Pick<ProjectCardData, 'title' | 'titleLocal'>,
  locale: Locale
): string {
  if (locale === 'zh' && project.titleLocal && stegaClean(project.titleLocal).trim()) {
    return project.titleLocal
  }
  return project.title ?? ''
}

/** Live and in-daily-use both mean working software, and the chip goes gold for both. */
export function isShipped(status: string | null | undefined): boolean {
  const key = status ? stegaClean(status) : ''
  return key === 'live' || key === 'inUse'
}

/** A project's year span — "2026" when it started and finished in one, "2024 — 2026" otherwise. */
export function formatYears(
  start: string | null | undefined,
  end: string | null | undefined,
  locale: Locale
): string {
  if (!start) return ''
  const from = stegaClean(start).slice(0, 4)
  if (!end) return `${from} — ${locale === 'zh' ? '至今' : 'now'}`
  const to = stegaClean(end).slice(0, 4)
  return from === to ? from : `${from} — ${to}`
}
