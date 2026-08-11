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

Run `npm run typegen` after **every** schema change, or the query types go stale.

---

## Known content gaps

Carried over from the prototype — these are empty on purpose rather than invented:

- **Contact details** — email, LinkedIn, GitHub and the résumé PDF were all
  `[NEED CONTENT]` placeholders. Until they are filled in, nobody can contact you.
- **Portrait image** — none supplied, so `Show portrait` is off.
- **Hero paragraph (English)** — the prototype's English slot held Chinese text. The
  English in the seed is a translation of the Chinese, not your writing. Review it.
- Sections still to build: Projects, Playground, Currently, Contact/CTA, plus the
  header and footer. They are designed in the prototype but not yet components.

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
| `/` | Hero, Numbers, three featured roles, closing CTA |
| `/about` | The thread, Currently, CTA |
| `/experience` | Every role, Numbers, CTA |
| `/contact` | CTA only |

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
