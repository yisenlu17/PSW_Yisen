import type { LocaleString, LocaleText } from './locale'

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
  resumeUrl?: string | null
  seoTitle?: LocaleString
  seoDescription?: LocaleText
}
