/**
 * Writes the case studies onto the three featured project documents.
 *
 * The Projects page carries a card — name, one line, a paragraph — and everything
 * longer than that lives on the project's own page. This is that content for
 * 我是懂球王, Just Hoop and 智排: the four-part write-up in both languages, plus the
 * lists the page renders as furniture around it (what it does, what I learned, what
 * it is built with) and the card fields that have to agree with them.
 *
 * Run it with an Editor token:
 *   SANITY_API_WRITE_TOKEN=... npm run project-detail
 *   npm run project-detail -- --dry-run    # print, change nothing
 *
 * The token can also live in .env.local as SANITY_API_WRITE_TOKEN, which is read
 * here the same way the seed reads it.
 *
 * It sets only the fields listed per project below and leaves every other field
 * alone — the cover image, the links and the slug included. Re-running is safe: keys
 * are derived from position, so a second run replaces rather than duplicates. If a
 * document has unpublished edits open in the studio, that draft wins on screen until
 * it is published — publish it first, or this looks like it did nothing.
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { PROJECTS, writeUp, keyed, refs } from './project-content.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DRY_RUN = process.argv.includes('--dry-run')

for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || projectId === 'placeholder') {
  console.error('✗ Set NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local first.')
  process.exit(1)
}
// Writing needs an Editor token; the dry run only prints, so it needs nothing.
if (!token && !DRY_RUN) {
  console.error('✗ SANITY_API_WRITE_TOKEN is required (an Editor token).')
  console.error('  Create one at https://www.sanity.io/manage → API → Tokens, then either')
  console.error('  add it to .env.local, or:')
  console.error('  SANITY_API_WRITE_TOKEN=<token> npm run project-detail')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token: token || process.env.SANITY_API_READ_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-07',
  useCdn: false,
})

/* ---------------------------------------------------------------------- write */

const tx = client.transaction()

for (const item of PROJECTS) {
  const { _id, nodes, related, ...fields } = item

  const set = {
    ...fields,
    ...(fields.roleDetail ? { roleDetail: keyed('role', fields.roleDetail) } : {}),
    ...(fields.tags ? { tags: keyed('tag', fields.tags) } : {}),
    ...(fields.features ? { features: keyed('feat', fields.features) } : {}),
    ...(fields.learnings ? { learnings: keyed('learn', fields.learnings) } : {}),
    body: writeUp(nodes, 'en'),
    bodyZh: writeUp(nodes, 'zh'),
    relatedProjects: refs(related),
  }

  const sections = nodes.filter((n) => n.kind === 'block' && n.style === 'h3').length
  console.log(
    `${DRY_RUN ? 'would write' : '→'} ${_id}\n` +
      `    status: ${set.status}  ·  ${sections} sections  ·  ` +
      `${set.body.length} EN blocks / ${set.bodyZh.length} ZH blocks\n` +
      `    lists: ${(set.features ?? []).length} features, ${(set.learnings ?? []).length} learnings` +
      (set.stack ? `, ${set.stack.length} stack` : '')
  )

  tx.patch(_id, { set })
}

if (DRY_RUN) {
  console.log('\nDry run. Re-run without --dry-run to write.')
  process.exit(0)
}

await tx.commit()
console.log('\n✓ Written. Three project pages now carry their case study.')
