/**
 * Repairs slugs that are not slugs.
 *
 * `project.dongqiuwang` shipped with `https://woshidongqiuwang.com/` in its slug
 * field, so every card linking to it pointed at `/projects/https://woshidongqiuwang.com/`
 * and rendered a 404. This rewrites any slug that is a pasted URL down to a single
 * path segment, and keeps the URL by moving it into the project's Links list — which
 * is where it was meant to go.
 *
 * Run:
 *   SANITY_API_WRITE_TOKEN=... node scripts/fix-slugs.mjs          # report only
 *   SANITY_API_WRITE_TOKEN=... node scripts/fix-slugs.mjs --apply  # write
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const APPLY = process.argv.includes('--apply')

for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN
if (!token) {
  console.error('✗ SANITY_API_WRITE_TOKEN is required (a Developer or Editor token).')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-07',
  useCdn: false,
})

/** Mirrors `slugifyPath` in src/sanity/schemaTypes/slugOptions.ts. */
function slugify(input) {
  const raw = input.trim().toLowerCase()
  const wasUrl = /^[a-z][a-z\d+.-]*:\/\//.test(raw) || raw.startsWith('www.')

  const parts = raw
    .replace(/^[a-z][a-z\d+.-]*:\/\//, '')
    .replace(/[?#].*$/, '')
    .split('/')
    .filter(Boolean)

  let segment = parts.length > 1 ? parts[parts.length - 1] : (parts[0] ?? '')
  if (parts.length <= 1 && wasUrl) segment = segment.replace(/^www\./, '').split('.')[0]

  return segment
    .replace(/[^\p{Letter}\p{Number}._~-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

const BAD = /[/\:?#[\]@\s]/
const isUrl = (v) => /^[a-z][a-z\d+.-]*:\/\//i.test(v.trim())

const docs = await client.fetch(
  `*[_type in ["project", "experience", "page"] && defined(slug.current)]{_id, _type, "slug": slug.current, links}`
)

const broken = docs.filter((d) => {
  const s = String(d.slug).trim()
  // "/" is the homepage and is deliberate.
  if (d._type === 'page' && s === '/') return false
  return BAD.test(s)
})

if (broken.length === 0) {
  console.log('✓ Every slug is a single path segment. Nothing to fix.')
  process.exit(0)
}

const tx = client.transaction()
for (const doc of broken) {
  const from = String(doc.slug).trim()
  const to = slugify(from)
  if (!to) {
    console.error(`✗ ${doc._id}: "${from}" leaves nothing usable — fix this one by hand.`)
    continue
  }

  const set = { slug: { _type: 'slug', current: to } }

  // A URL in the slug field is a URL the editor meant to record somewhere. On a
  // project that somewhere is Links, so it survives the repair.
  if (doc._type === 'project' && isUrl(from)) {
    const links = doc.links ?? []
    if (!links.some((l) => l?.url === from)) {
      set.links = [
        ...links,
        {
          _key: 'live',
          _type: 'projectLink',
          kind: 'live',
          label: { _type: 'localeString', en: 'Live site', zh: '访问网站' },
          url: from,
        },
      ]
    }
  }

  console.log(
    `${APPLY ? '→' : 'would fix'} ${doc._id}\n    slug:  "${from}"  →  "${to}"` +
      (set.links ? `\n    links: + ${from}` : '')
  )
  tx.patch(doc._id, { set })
}

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to write.')
  process.exit(0)
}

await tx.commit()
console.log('\n✓ Written.')
