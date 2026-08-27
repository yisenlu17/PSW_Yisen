/**
 * Writes the words that introduce me onto the documents that carry them.
 *
 * The copy is in `intro-content.mjs`; this is only transport. It sets the fields that
 * file names and leaves every other field on those documents alone — the hero's
 * headline, its rotating words, the steps under the About lede, all untouched.
 *
 *   SANITY_API_WRITE_TOKEN=... npm run intro
 *   npm run intro -- --dry-run    # print the before and after, change nothing
 *
 * The token can also live in .env.local, or come from `npx sanity login` — see
 * sanity-write.mjs.
 *
 * Re-running is safe: every write is an overwrite of a named field, so a second run
 * sets the same values again. If a document has unpublished edits open in the studio,
 * that draft wins on screen until it is published — publish it first, or this looks
 * like it did nothing.
 */
import { writeClient } from './sanity-write.mjs'
import { PLACEMENTS } from './intro-content.mjs'

const DRY_RUN = process.argv.includes('--dry-run')
const client = writeClient('npm run intro', { needsWrite: !DRY_RUN })

/** One line of before/after, short enough to scan a run of them. */
const preview = (value) => {
  const text = value?.zh ?? value?.en ?? ''
  return text.length > 96 ? `${text.slice(0, 95)}…` : text
}

const ids = PLACEMENTS.map((p) => p._id)
const docs = new Map(
  (await client.fetch(`*[_id in $ids]{ _id, sections }`, { ids })).map((d) => [d._id, d])
)

const tx = client.transaction()
let missing = 0

for (const { _id, set = {}, sections: wanted = {} } of PLACEMENTS) {
  const doc = docs.get(_id)
  if (!doc) {
    console.error(`✗ ${_id} is not in this dataset — skipped.`)
    missing++
    continue
  }

  console.log(`${DRY_RUN ? 'would write' : '→'} ${_id}`)
  const patch = { ...set }
  for (const [field, value] of Object.entries(set)) {
    console.log(`    ${field}: ${preview(value)}`)
  }

  const keys = Object.keys(wanted)
  if (keys.length > 0) {
    // Sections are an array, so the whole array is written back with the named ones
    // changed. Matching on `_key` rather than on position is what lets a section be
    // dragged up the page in the studio without this putting the paragraph somewhere
    // else the next time it runs.
    const found = new Set()
    patch.sections = (doc.sections ?? []).map((section) => {
      const fields = wanted[section._key]
      if (!fields) return section
      found.add(section._key)
      for (const [field, value] of Object.entries(fields)) {
        console.log(`    ${section._key}.${field}: ${preview(value)}`)
      }
      return { ...section, ...fields }
    })

    for (const key of keys) {
      if (!found.has(key)) {
        console.error(`    ✗ no section called "${key}" on ${_id} — its copy has nowhere to go`)
        missing++
      }
    }
  }

  tx.patch(_id, { set: patch })
}

if (missing > 0) {
  console.error(`\n✗ ${missing} placement(s) had nowhere to land. Nothing written.`)
  process.exit(1)
}

if (DRY_RUN) {
  console.log('\nDry run. Re-run without --dry-run to write.')
  process.exit(0)
}

await tx.commit()
console.log('\n✓ Written. The hero, the About lede and the site bio all say the same thing.')
