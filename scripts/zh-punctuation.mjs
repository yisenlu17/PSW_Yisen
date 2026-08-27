/**
 * Repunctuates the Chinese copy in the dataset.
 *
 * The rule and the reason for it are in `zh-text.mjs`; this is only transport. It
 * walks every document that carries copy, rewrites the Chinese fields, and leaves the
 * English ones exactly as they are — ASCII commas and all, because there they are
 * correct.
 *
 *   SANITY_API_WRITE_TOKEN=... npm run zh-punctuation
 *   npm run zh-punctuation -- --dry-run    # print every change, write nothing
 *
 * The token can also live in .env.local, or come from `npx sanity login` — see
 * sanity-write.mjs.
 *
 * Safe to re-run: the marks it writes are not ones it matches, so a second pass finds
 * nothing to do. Worth running after anything that adds Chinese copy by hand in the
 * studio. The seed's own source copy is already corrected, so a reseed does not undo
 * this.
 */
import { writeClient } from './sanity-write.mjs'
import { normalizeZh, isChineseField } from './zh-text.mjs'

const DRY_RUN = process.argv.includes('--dry-run')
const client = writeClient('npm run zh-punctuation', { needsWrite: !DRY_RUN })

/** Every Chinese string on a document, rewritten in place. */
function rewrite(value, key, changes, path) {
  if (Array.isArray(value)) return value.map((v, i) => rewrite(v, null, changes, `${path}[${i}]`))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = rewrite(v, k, changes, path ? `${path}.${k}` : k)
    }
    return out
  }

  if (typeof value !== 'string' || !isChineseField(key, path)) return value

  const next = normalizeZh(value)
  if (next !== value) changes.push({ path, before: value, after: next })
  return next
}

const TYPES = ['page', 'globalSettings', 'project', 'experience', 'playgroundItem', 'navigation']
const docs = await client.fetch(`*[_type in $types && !(_id in path("drafts.**"))]`, { types: TYPES })

const tx = client.transaction()
let touched = 0
let fields = 0

/**
 * A document's own fields, without the ones the API owns.
 *
 * `_id`, `_rev` and the timestamps come back on every document and are rejected on
 * the way in. Only the top level is filtered: `_type` and `_key` inside a section are
 * content, and dropping them would flatten the page.
 */
const contentOf = (doc) => Object.fromEntries(Object.entries(doc).filter(([k]) => !k.startsWith('_')))

for (const doc of docs) {
  const changes = []
  const next = rewrite(contentOf(doc), null, changes, '')
  if (changes.length === 0) continue

  touched++
  fields += changes.length
  console.log(`${DRY_RUN ? 'would write' : '→'} ${doc._id}  ·  ${changes.length} field(s)`)
  for (const change of changes) {
    console.log(`    ${change.path}`)
    console.log(`      −  ${change.before.slice(0, 108)}`)
    console.log(`      +  ${change.after.slice(0, 108)}`)
  }

  tx.patch(doc._id, { set: next })
}

console.log(
  `\n${touched} of ${docs.length} documents had ASCII punctuation in Chinese copy` +
    ` — ${fields} field(s) in all.`
)

if (touched === 0) {
  console.log('Nothing to do.')
  process.exit(0)
}
if (DRY_RUN) {
  console.log('\nDry run. Re-run without --dry-run to write.')
  process.exit(0)
}

await tx.commit()
console.log('\n✓ Written. The Chinese copy is punctuated as Chinese throughout.')
