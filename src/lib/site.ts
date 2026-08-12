import { stegaClean } from 'next-sanity'

import type { urlFor } from '@/sanity/image'
import type { Locale, LocaleString, LocaleText } from './locale'

/** Whatever shape `urlFor` accepts, so image fields stay assignable to it. */
type SanityImage = Parameters<typeof urlFor>[0]

/** An uploaded asset as the résumé fields resolve to. */
export type UploadedFile = { url?: string | null; originalFilename?: string | null } | null

/** Global settings, as read once per page and threaded to whichever section needs it. */
export type SiteSettings = {
  _id?: string
  name?: string | null
  nameLocal?: string | null
  shortBio?: LocaleText
  currentRole?: LocaleString
  currentLocation?: LocaleString
  availability?: LocaleString
  email?: string | null
  socialLinks?: Array<{
    _key: string
    platform?: string | null
    label?: string | null
    url?: string | null
  }> | null
  resume?: { en?: UploadedFile; zh?: UploadedFile } | null
  seoTitle?: LocaleString
  seoDescription?: LocaleText
  favicon?: SanityImage | null
}

/** Which of the two résumé PDFs a button should hand over. */
export type ResumeChoice = 'auto' | 'en' | 'zh'

/**
 * Picks a résumé and turns it into a link that downloads rather than opens.
 *
 * `auto` follows the language the visitor is reading the site in, which is the right
 * default: someone reading 中文 wants the Chinese CV. Either language falls back to
 * the other, so uploading one file still gives every visitor a working button rather
 * than half of them a missing one.
 *
 * Sanity's `?dl=` turns the CDN URL into a download with a real filename, so the file
 * lands in Downloads as 卢一森_中文简历.pdf instead of opening as a tab titled with a
 * 40-character asset hash.
 */
export function resumeFor(
  site: SiteSettings | null,
  locale: Locale,
  choice: ResumeChoice = 'auto'
): { url: string; filename: string } | null {
  const wanted = choice === 'auto' ? locale : choice
  const other = wanted === 'en' ? 'zh' : 'en'
  const file = site?.resume?.[wanted]?.url ? site.resume[wanted] : site?.resume?.[other]

  if (!file?.url) return null

  const url = stegaClean(file.url)
  const filename = file.originalFilename ? stegaClean(file.originalFilename) : ''

  return {
    url: filename ? `${url}?dl=${encodeURIComponent(filename)}` : `${url}?dl=`,
    filename,
  }
}
