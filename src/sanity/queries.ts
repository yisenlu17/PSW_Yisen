import { defineQuery } from 'next-sanity'

/**
 * Both Experience modes resolve to the same `roles` array here rather than in the
 * component, so `auto` and `manual` are indistinguishable by the time they are
 * rendered. Sorting `auto` by `order` first and `startDate` second lets an editor
 * override the chronology for one role without having to number all of them.
 */
const EXPERIENCE_FIELDS = /* groq */ `
  _id,
  company,
  "slug": slug.current,
  role,
  category,
  location,
  logo,
  startDate,
  endDate,
  featured,
  order,
  summary,
  secondary,
  highlight,
  skills
`

const SECTIONS = /* groq */ `
  sections[]{
    _key,
    _type,
    settings,

    _type == "heroSection" => {
      eyebrow,
      headlineLine1,
      headlineLine2,
      rotatingWords,
      lede,
      ctas[]{ _key, label, href, style },
      metaItems,
      showPortrait,
      portrait,
      portraitBadge,
      rotateHeadlineWord
    },

    _type == "editorialIntroSection" => {
      eyebrow,
      title,
      lede,
      note,
      steps[]{ _key, title, body }
    },

    _type == "statsSection" => {
      eyebrow,
      title,
      note,
      feature{ source, value, description },
      stats[]{ _key, value, suffix, countTo, label, source }
    },

    _type == "currentlySection" => {
      eyebrow,
      title,
      updatedLabel,
      items[]{ _key, label, body }
    },

    _type == "ctaSection" => {
      eyebrow,
      title,
      body,
      actions[]{ _key, label, intent, platform, href, style }
    },

    _type == "experienceSection" => {
      eyebrow,
      title,
      lede,
      variant,
      source,
      limit,
      // GROQ slice bounds must be literal, so the ceiling is fixed here and the
      // editor's own limit is applied when rendering.
      "roles": select(
        source == "manual" => roles[]->{ ${EXPERIENCE_FIELDS} },
        *[_type == "experience" && !(_id in path("drafts.**"))]
          | order(coalesce(order, 9999) asc, startDate desc)[0...50]{ ${EXPERIENCE_FIELDS} }
      )
    }
  }
`

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    seoTitle,
    seoDescription,
    ogImage,
    ${SECTIONS}
  }
`)

export const PAGE_SLUGS_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current)].slug.current
`)

export const GLOBAL_SETTINGS_QUERY = defineQuery(`
  *[_type == "globalSettings"][0]{
    _id,
    name,
    nameLocal,
    profileImage,
    shortBio,
    currentRole,
    currentLocation,
    availability,
    email,
    socialLinks[]{ _key, platform, label, url },
    "resumeUrl": resume.asset->url,
    seoTitle,
    seoDescription,
    ogImage
  }
`)

export const NAVIGATION_QUERY = defineQuery(`
  *[_type == "navigation"][0]{
    _id,
    items[!hidden]{ _key, label, href, external, emphasis },
    footerStatement,
    footerNote,
    copyright
  }
`)
