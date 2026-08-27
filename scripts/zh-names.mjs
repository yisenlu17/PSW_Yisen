/**
 * Gives the Chinese pages their Chinese words.
 *
 * Three things were still English on a 中文 page, for three different reasons:
 *
 *  · `company` and `location` were single strings — right for a name that is the
 *    same in both languages, wrong for one that is not. The role page for
 *    上海智烽体育文化传播有限公司 was headed "Zhifeng Sports Culture" and dated
 *    "· CHANGZHOU" with every other word on it in Chinese. `companyLocal` and
 *    `locationLocal` are the second name where there is one, which is the bargain
 *    `titleLocal` already strikes on projects.
 *  · The Playground label was authored as the literal string "playground" in both
 *    languages, in the nav and again in the section's own eyebrow.
 *
 * The company names are the ones on the Chinese résumé, spelled as it spells them —
 * including 智烽, which is not the 智锋 a transliteration of "Zhifeng" would guess at,
 * and which is exactly why they are copied rather than invented. Orfeostory and
 * Stranger Soccer are absent on purpose: the résumé writes "Orfeostory（新加坡）", so
 * a Latin brand name stays Latin and the Chinese pages show the name above.
 *
 * Run:
 *   node scripts/zh-names.mjs          # report only
 *   node scripts/zh-names.mjs --apply  # write
 */
import { writeClient } from './sanity-write.mjs'

const APPLY = process.argv.includes('--apply')
const client = writeClient('scripts/zh-names.mjs', { needsWrite: APPLY })

/** Keyed by document id. A company with no Chinese name simply has no `companyLocal`. */
const ROLES = {
  'experience.orfeostory': { locationLocal: '新加坡' },
  'experience.stranger-soccer': { locationLocal: '新加坡' },
  'experience.ernst-young': {
    companyLocal: '安永（中国）企业咨询有限公司',
    locationLocal: '上海',
  },
  'experience.suoao': { companyLocal: '上海梭翱信息技术有限公司', locationLocal: '上海' },
  'experience.zhifeng': {
    companyLocal: '上海智烽体育文化传播有限公司',
    locationLocal: '常州',
  },
}

/** 兴趣 is the résumé's own word for this — 「兴趣：足球、篮球、羽毛球……」. */
const PLAYGROUND_ZH = '兴趣'

const roles = await client.fetch(
  `*[_type == "experience" && _id in $ids]{ _id, company, companyLocal, location, locationLocal }`,
  { ids: Object.keys(ROLES) }
)

const tx = client.transaction()
const changes = []

for (const doc of roles) {
  const set = Object.fromEntries(
    Object.entries(ROLES[doc._id]).filter(([field, value]) => doc[field] !== value)
  )
  if (Object.keys(set).length === 0) continue

  changes.push(
    `${doc._id} (${doc.company})\n    ` +
      Object.entries(set)
        .map(([field, value]) => `${field}: ${value}`)
        .join('  ·  ')
  )
  tx.patch(doc._id, { set })
}

// The nav item is found by where it points rather than by key, so a re-ordered menu
// still gets the right one.
const nav = await client.fetch(`*[_type == "navigation"][0]{ _id, items[]{ _key, href, label } }`)
const playgroundItem = (nav?.items ?? []).find((i) => i.href === '/playground')

if (playgroundItem && playgroundItem.label?.zh !== PLAYGROUND_ZH) {
  changes.push(
    `${nav._id} → menu item "${playgroundItem.label?.en}"\n    ` +
      `label.zh: ${playgroundItem.label?.zh} → ${PLAYGROUND_ZH}`
  )
  tx.patch(nav._id, {
    set: { [`items[_key=="${playgroundItem._key}"].label.zh`]: PLAYGROUND_ZH },
  })
}

// And the same word on the page itself, so the nav and the eyebrow under it agree.
const page = await client.fetch(
  `*[_type == "page" && slug.current == "playground"][0]{
     _id, sections[_type == "playgroundSection"]{ _key, eyebrow }
   }`
)
const section = (page?.sections ?? [])[0]

if (section && section.eyebrow?.zh !== PLAYGROUND_ZH) {
  changes.push(
    `${page._id} → Playground eyebrow\n    ` +
      `eyebrow.zh: ${section.eyebrow?.zh} → ${PLAYGROUND_ZH}`
  )
  tx.patch(page._id, {
    set: { [`sections[_key=="${section._key}"].eyebrow.zh`]: PLAYGROUND_ZH },
  })
}

const noChineseName = roles.filter((d) => !ROLES[d._id]?.companyLocal)
if (noChineseName.length > 0) {
  console.log('  No Chinese company name, on purpose — the 中文 pages show the name as typed:')
  noChineseName.forEach((d) => console.log(`    · ${d.company}`))
  console.log('')
}

if (changes.length === 0) {
  console.log('✓ Nothing to set.')
  process.exit(0)
}

changes.forEach((line) => console.log(`${APPLY ? '→' : 'would set'} ${line}`))

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to write.')
  process.exit(0)
}

await tx.commit()
console.log(`\n✓ Written — ${changes.length} change${changes.length === 1 ? '' : 's'}.`)
