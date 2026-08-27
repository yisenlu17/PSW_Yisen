/**
 * Sends the two hero buttons to the pages their labels promise.
 *
 * The prototype had them crossed: "See the work / 看看我做的东西" opened Experience,
 * and "Start with the story / 先从故事开始" opened About. The work is the projects,
 * and the story is the roles the projects came out of — so each button now lands on
 * the page a reader would expect from its own label. `scripts/seed.mjs` writes the
 * same pair for a fresh dataset; this repairs one that already exists.
 *
 * Matching is by `_key`, because the labels are the thing that might be reworded and
 * the destination is the thing being fixed. A hero whose buttons already point at
 * these pages is left alone.
 *
 * Run:
 *   node scripts/hero-ctas.mjs          # report only
 *   node scripts/hero-ctas.mjs --apply  # write
 */
import { writeClient } from './sanity-write.mjs'

const APPLY = process.argv.includes('--apply')
const client = writeClient('scripts/hero-ctas.mjs', { needsWrite: APPLY })

/** Where each seeded button belongs. */
const DESTINATION = { cta1: '/projects', cta2: '/experience' }

const pages = await client.fetch(
  `*[_type == "page" && count(sections[_type == "heroSection"]) > 0]{
     _id, "slug": slug.current, sections[_type == "heroSection"]{ _key, ctas }
   }`
)

const patches = []

for (const page of pages) {
  for (const hero of page.sections ?? []) {
    for (const [index, cta] of (hero.ctas ?? []).entries()) {
      const want = DESTINATION[cta._key]
      if (!want || cta.href === want) continue

      // Addressed by key rather than by index so a reordered hero still patches the
      // button it means to.
      patches.push({
        _id: page._id,
        path: `sections[_key=="${hero._key}"].ctas[_key=="${cta._key}"].href`,
        label: cta.label?.en ?? `cta ${index + 1}`,
        from: cta.href ?? '(unset)',
        to: want,
        page: page.slug,
      })
    }
  }
}

if (patches.length === 0) {
  console.log('✓ Every hero button already points where its label says. Nothing to do.')
  process.exit(0)
}

const tx = client.transaction()
for (const p of patches) {
  console.log(`${APPLY ? '→' : 'would fix'} ${p._id} (${p.page})\n    "${p.label}":  ${p.from}  →  ${p.to}`)
  tx.patch(p._id, { set: { [p.path]: p.to } })
}

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to write.')
  process.exit(0)
}

await tx.commit()
console.log(`\n✓ Written — ${patches.length} button${patches.length === 1 ? '' : 's'}.`)
