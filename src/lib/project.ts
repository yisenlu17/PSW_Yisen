import { stegaClean } from 'next-sanity'

import { t, type Locale, type LocaleString, type LocaleText } from './locale'
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
  handles?: ProjectHandle[] | null
  /** Artwork an account puts out, shown whole as thumbnails. Not a cover for the card. */
  covers?: SanityImage[] | null
}

/** An account named by its ID: a 抖音号 has no address, only a number to search for. */
export type ProjectHandle = {
  _key: string
  platform?: string | null
  id?: string | null
  label?: LocaleString
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

/**
 * The platform's own name, in both languages, so "抖音 94617971040" reads the same
 * everywhere it appears. A platform not listed falls back to the value as typed.
 */
const HANDLE_PLATFORM: Record<string, { en: string; zh: string }> = {
  douyin: { en: 'Douyin', zh: '抖音' },
  xiaohongshu: { en: 'Xiaohongshu', zh: '小红书' },
  bilibili: { en: 'Bilibili', zh: '哔哩哔哩' },
  wechat: { en: 'WeChat', zh: '微信公众号' },
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
 * "抖音 94617971040" — a platform and the number you type into it.
 *
 * Deliberately not a link: a 抖音号 identifies an account inside the app and there is
 * no web address that opens it, so this is text to read and copy rather than
 * something that looks clickable and is not.
 */
export function handleLines(
  handles: ProjectHandle[] | null | undefined,
  locale: Locale
): string[] {
  return (handles ?? [])
    .map((handle) => {
      const id = handle.id ? stegaClean(handle.id).trim() : ''
      if (!id) return ''
      const platform = handle.platform ? stegaClean(handle.platform) : ''
      const name =
        t(handle.label, locale) || HANDLE_PLATFORM[platform]?.[locale] || HANDLE_PLATFORM[platform]?.en || platform
      return name ? `${name} ${id}` : id
    })
    .filter(Boolean)
}

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

/**
 * Still being worked on — as opposed to shipped, or stopped.
 *
 * Read by the detail page to explain an empty row of buttons: a project being built
 * has no address to give out yet, which is worth saying once where the link would be
 * rather than leaving a visitor to hunt for one.
 */
export function isInProgress(status: string | null | undefined): boolean {
  const key = status ? stegaClean(status) : ''
  return key === 'building' || key === 'validating' || key === 'prototype'
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
