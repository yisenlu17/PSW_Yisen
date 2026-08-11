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

/**
 * Card-level project fields. The case-study fields are deliberately absent: a
 * Projects section with five cards would otherwise drag five full write-ups and
 * their galleries across the wire to render three paragraphs.
 */
const PROJECT_CARD_FIELDS = /* groq */ `
  _id,
  title,
  titleLocal,
  "slug": slug.current,
  category,
  status,
  role,
  startDate,
  endDate,
  featured,
  order,
  tagline,
  summary,
  tags,
  highlight,
  cover
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

    _type == "quoteSection" => {
      quote,
      attribution,
      context,
      portrait,
      variant
    },

    _type == "photoGallerySection" => {
      eyebrow,
      title,
      lede,
      variant,
      photos[]{ _key, asset, hotspot, crop, alt, caption }
    },

    _type == "bentoGridSection" => {
      eyebrow,
      title,
      lede,
      tiles[]{ _key, size, tone, kicker, title, body, stat, image, href }
    },

    _type == "videoFeatureSection" => {
      eyebrow,
      title,
      body,
      variant,
      video{
        source,
        url,
        "file": file{ asset->{ url } },
        poster,
        title,
        caption
      }
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
    },

    _type == "projectsSection" => {
      eyebrow,
      title,
      lede,
      source,
      limit,
      alsoLabel,
      linkToDetail,
      "projects": select(
        source == "manual" => projects[]->{ ${PROJECT_CARD_FIELDS} },
        *[_type == "project" && !(_id in path("drafts.**"))]
          | order(coalesce(order, 9999) asc, startDate desc)[0...50]{ ${PROJECT_CARD_FIELDS} }
      )
    },

    _type == "playgroundSection" => {
      eyebrow,
      title,
      lede,
      source,
      statement{ label, body },
      interestsLabel,
      note,
      primaryImage,
      secondaryImage,
      "items": select(
        source == "manual" => items[]->{ _id, kind, name, nameLocal, note, prominent, order },
        *[_type == "playgroundItem" && !(_id in path("drafts.**"))]
          | order(coalesce(order, 9999) asc, name asc)[0...60]{
            _id, kind, name, nameLocal, note, prominent, order
          }
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

/* ------------------------------------------------------------------ details */

/**
 * The full project, for `/projects/<slug>`.
 *
 * `relatedProjects` resolves to card fields only — one hop, not a recursive walk —
 * so a chain of projects that all reference each other still costs a single query.
 */
export const PROJECT_QUERY = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    _type,
    ${PROJECT_CARD_FIELDS},
    problem,
    approach,
    outcome,
    body,
    bodyZh,
    metrics[]{ _key, value, label, source },
    features,
    learnings,
    stack,
    gallery[]{ _key, alt, caption, asset },
    links[]{ _key, kind, label, url },
    relatedExperience->{ _id, company, "slug": slug.current, role, category },
    relatedProjects[]->{ ${PROJECT_CARD_FIELDS} },
    seoTitle,
    seoDescription
  }
`)

export const PROJECT_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)].slug.current
`)

/**
 * The full role, for `/experience/<slug>`.
 *
 * Projects point at roles rather than the other way round, so the "what came out of
 * it" list is found by reverse lookup instead of a second field an editor would have
 * to keep in sync with the one on the project.
 */
export const EXPERIENCE_QUERY = defineQuery(`
  *[_type == "experience" && slug.current == $slug][0]{
    ${EXPERIENCE_FIELDS},
    _type,
    secondary,
    fullStory,
    responsibilities,
    problemsSolved,
    metrics[]{ _key, value, label },
    images[]{ _key, alt, asset },
    documents[]{ _key, "url": asset->url, "filename": asset->originalFilename },
    "projects": *[_type == "project" && !(_id in path("drafts.**")) && relatedExperience._ref == ^._id]
      | order(coalesce(order, 9999) asc)[0...6]{ ${PROJECT_CARD_FIELDS} }
  }
`)

export const EXPERIENCE_SLUGS_QUERY = defineQuery(`
  *[_type == "experience" && defined(slug.current)].slug.current
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
    ogImage,
    favicon
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
