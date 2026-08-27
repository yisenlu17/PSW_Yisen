# PSW_Yisen — Personal Website System

Three things, not one site:

1. **The website** — Next.js 16, deployed on Vercel.
2. **The CMS** — Sanity Studio at `/studio`, where content, media and page order are managed.
3. **The component system** — premium sections written in code, registered to the CMS.

The dividing line runs through everything here: **content is yours, design is the code's.**
You can change almost anything without being able to make the site ugly.

---

## First-time setup

You need a Sanity project before the site will run.

```bash
# 1. Create the project (opens a browser to log in)
npx sanity login
npx sanity projects create "PSW Yisen"

# 2. Put the project ID into .env.local
#    NEXT_PUBLIC_SANITY_PROJECT_ID=<the id it printed>

# 3. Create two tokens at https://www.sanity.io/manage → API → Tokens
#    · a Viewer token  → SANITY_API_READ_TOKEN in .env.local
#    · an Editor token → used once for seeding, below

# 4. Load the prototype's copy into the dataset
SANITY_API_WRITE_TOKEN=<editor token> npm run seed

# 5. Run it
npm run dev
```

- Site — http://localhost:3000
- Studio — http://localhost:3000/studio

---

## Day-to-day

| What you want to do | Where |
| --- | --- |
| Change any wording | Studio → Pages → Homepage |
| Add an internship | Studio → Experience → Create |
| Add a project | Studio → Projects → Create |
| Add a sport or interest | Studio → Playground → Create |
| Reorder sections | Studio → Presentation → drag the section |
| Hide a section | Section settings → Hide this section |
| Swap an image | Click the image field, upload |
| Update your email everywhere | Global settings → Email |

Editing is bilingual: every text field has an **English** and a **中文** box. English is
the fallback — leave 中文 empty and the site shows English rather than a blank.

Preview before publishing: open **Presentation** in the studio, edit, check it, then
hit Publish. Sanity keeps revision history, so a mistake is recoverable.

---

## Adding a new section type

This is the only part that needs code. Roughly 3 files:

1. `src/components/sections/YourSection.tsx` — the React component.
2. `src/sanity/schemaTypes/objects/sections/yourSection.ts` — its fields.
3. Register it in `src/sanity/schemaTypes/index.ts` and `documents/page.ts`.

Then `npm run typegen`. From that point it is a block you can add, reorder and hide
in the studio — with no further code involved.

**Give it only closed-list options.** No free-text CSS, no arbitrary colours. Every
knob an editor gets is one more way the design can drift.

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Site + studio locally |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run typegen` | Regenerate types after any schema change |
| `npm run seed` | One-time content import (safe to re-run; won't overwrite) |
| `npm run experience-detail` | Writes the CV write-up onto the five roles (`-- --dry-run` to preview) |
| `npm run project-detail` | Writes the case studies, and the two accounts' 抖音号 and covers |
| `npm run playground` | Writes the Playground bento grid and photo gallery |
| `npm run media` | Uploads every picture in `media/` that the content modules name |
| `npm run intro` | Writes the paragraphs that introduce me — hero, About lede, site bio, SEO |
| `npm run zh-punctuation` | Repunctuates Chinese copy full-width; run after editing 中文 in the studio |

Every writer takes `-- --dry-run` and prints what it would change without writing.
The words they write live beside them in `*-content.mjs`, so copy can be reworded
without touching the transport — see [`media/README.md`](media/README.md) for the
pictures and `scripts/intro-content.mjs` for the self-description.

Run `npm run typegen` after **every** schema change, or the query types go stale.

---

## Known content gaps

Carried over from the prototype — these are empty on purpose rather than invented:

- **Contact details** — email, LinkedIn, GitHub and the résumé PDF were all
  `[NEED CONTENT]` placeholders. Until they are filled in, nobody can contact you.
- **Portrait image** — none supplied, so `Show portrait` is off.
- **Hero paragraph (English)** — the prototype's English slot held Chinese text. The
  English in the seed is a translation of the Chinese, not your writing. Review it.
- **Project covers and links** — every project card has a 16:10 image slot and a
  Links list, both empty. The cards keep their frame without an image, so the page
  works meanwhile, but an interviewer sees three grey rectangles.
- **我是懂球王's status** — the prototype claimed neither "live" nor "in progress" for
  it, and its link and user count were `[NEED CONTENT]`. Status is left unset rather
  than guessed; pick one in the studio and the chip appears.
- **Playground photographs** — the two `<image-slot>`s in the prototype were empty.
  The mosaic drops to fewer columns until they are filled, rather than showing gaps.
- **Case-study fields** — every project publishes from its card fields alone. The
  problem/approach/outcome fields and the full write-up are what turn `/projects/…`
  into something worth reading; they are empty on every seeded project.

## A note on the dataset

The dataset is not anonymously readable — this project uses role-based access
control and the anonymous group has no read grant. Every query therefore needs
`SANITY_API_READ_TOKEN`, which is why `src/sanity/client.ts` starts with
`import 'server-only'`: reads happen in Server Components and route handlers, and
that import turns any accidental use from a Client Component into a build error
rather than a leaked token.

The upside is that drafts stay private. A half-written role is not fetchable by
anyone who knows the project ID.

## Pages

The site is a homepage plus real subpages, not one long scroll. Each page is a
`page` document whose slug becomes its URL, so adding `/projects` means creating a
document — no route to write.

| URL | Holds |
| --- | --- |
| `/` | Hero, Numbers, three featured roles, three featured projects, closing CTA |
| `/about` | The thread, Currently, CTA |
| `/experience` | Every role, Numbers, CTA |
| `/projects` | Every project, "Also running", CTA |
| `/playground` | The sports-and-interests mosaic, CTA |
| `/contact` | CTA only |

Two routes are generated from documents rather than from `page` documents, because a
project and a role each need a page of their own without one being assembled by hand:

| URL | Comes from |
| --- | --- |
| `/projects/<slug>` | One per **Project** document |
| `/experience/<slug>` | One per **Experience** document |

Creating a project in the studio publishes its page. Nothing else is needed — no
route to write, no section to add, no link to remember: the Projects section picks it
up and the card links to it.

Header and footer come from the **Navigation** document and render on every page.
Language is stored in a cookie rather than a query string — layouts do not receive
searchParams, so a `?lang=` approach would leave the header in English while the
body switched.

## Sections available today

| Section | What it does |
| --- | --- |
| Hero | Headline with a rotating gold word, buttons, meta strip, optional portrait |
| Editorial intro | A claim plus auto-numbered steps; the last step inverts to dark |
| Stats | One wide feature panel plus a grid of numbers that count up on scroll |
| Experience | Pulls Experience documents — featured as cards, the rest as a list |
| Projects | Pulls Project documents — featured as alternating cards, the rest as "Also running". Cards link to `/projects/<slug>` |
| Playground | Pulls Playground items — prominent sports as tiles, the rest stacked, interests as pills, plus a statement panel and two photographs |

## Why a project has three narrative fields, not ten

The spec listed Overview, Problem, Insight, Idea, Solution, What I Built, Process,
Challenges, Results and Reflection as separate fields. They are consolidated into
**Problem / Approach / Outcome**, plus a free-form body and a learnings list — a
decision taken deliberately, not a gap.

Ten adjacent boxes on one screen is a form nobody finishes, and the ones that do
get filled repeat each other: Insight and Idea want the same sentence, Solution and
What I Built want the same paragraph. Three fields carry the same story, and the
body field takes anything that does not fit in them.

## Depth, and where it lives

A project is written once and read at two depths. The **Card** field group is what
appears in the Projects section; the **Case study** group only ever appears on
`/projects/<slug>`. A project with just its card fields filled in is publishable —
the detail page falls back to showing those. Fill in the case-study fields and the
same page grows into a write-up, with no content moved between fields.

The same is true of a role: the Experience section shows the summary, and
`/experience/<slug>` shows the full story, responsibilities, problems solved,
metrics, images and attachments that the Experience document could always hold.

Projects point at roles (**Links & related → Related role**), not the other way
round. A role's page finds its projects by looking for the ones that name it, so the
connection is made once, in one document.
