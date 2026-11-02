/**
 * Writes the case studies onto the four featured project documents.
 *
 * The Projects page carries a card — name, one line, a paragraph — and everything
 * longer than that lives on the project's own page. This is that content for
 * Exploremehere, 我是懂球王, Just Hoop and 智排: the write-up in both languages, plus the
 * lists the page renders as furniture around it (what it does, what I learned, what
 * it is built with) and the card fields that have to agree with them.
 *
 * Run it with an Editor token:
 *   SANITY_API_WRITE_TOKEN=... npm run project-detail
 *   npm run project-detail -- --dry-run    # print, change nothing
 *
 * The token can also live in .env.local as SANITY_API_WRITE_TOKEN, or come from
 * `npx sanity login` — see sanity-write.mjs.
 *
 * It sets only the fields listed per project below and leaves every other field
 * alone — the slug included. The pictures it does set, because it is the same
 * decision as the words: a cover for the project and the screenshots placed inside
 * the write-up, both matched to what `npm run media` has uploaded. A
 * screenshot that is not in the dataset yet is skipped, leaving the cover as it was
 * and the write-up without that picture — never a broken one. The links too, for the
 * same reason: which door a page offers is part of what the page says.
 *
 * The two accounts in the "Also running" strip are patched as well, with what they
 * have to say for themselves: a 抖音号 each, and — where there is artwork for it —
 * the covers the account puts out, which the strip shows as thumbnails.
 *
 * Re-running is safe: keys are derived from position, so a second run replaces rather
 * than duplicates. If a document has unpublished edits open in the studio, that draft
 * wins on screen until it is published — publish it first, or this looks like it did
 * nothing.
 */
import { writeClient } from './sanity-write.mjs'
import { PROJECTS, ACCOUNTS, writeUp, keyed, refs, mediaFiles } from './project-content.mjs'
import { PHOTOS, ACCOUNT_COVERS } from './photo-content.mjs'

const DRY_RUN = process.argv.includes('--dry-run')
const client = writeClient('npm run project-detail', { needsWrite: !DRY_RUN })

/* --------------------------------------------------------------------- media */

/**
 * The screenshots are matched by filename, which is what keeps the two scripts apart:
 * one puts `media/project/just-hoop-lobby.png` in the dataset, this one asks for the asset
 * that came from a file of that name. Newest wins, so retaking a screenshot under the
 * same name and uploading it again is enough to change what the page shows.
 */
const assets = new Map(
  (
    await client.fetch(
      `*[_type == "sanity.imageAsset" && originalFilename in $files]
        | order(_createdAt asc)
        { _id, originalFilename }`,
      {
        files: [
          ...new Set([...mediaFiles().map((m) => m.file), ...Object.values(ACCOUNT_COVERS).flat()]),
        ],
      }
    )
  ).map((asset) => [asset.originalFilename, asset])
)

/**
 * The cover, whole.
 *
 * No crop and no hotspot: these are screenshots, and a cover cropped to a fixed shape
 * loses whichever half of the page was not in the frame. The pages give the picture
 * its own height instead, so what ships is what was captured. Writing the whole
 * `cover` object also clears a crop left behind by an earlier run.
 */
function cover(spec) {
  const asset = spec && assets.get(spec.file)
  if (!asset) return null
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    ...(spec.alt ? { alt: spec.alt } : {}),
  }
}

/** `_file` is how the preview finds the picture on disk; the studio would call it an unknown field. */
const forDataset = (blocks) =>
  blocks.map((block) => {
    const copy = { ...block }
    delete copy._file
    return copy
  })

/* ---------------------------------------------------------------------- write */

const refsByFile = Object.fromEntries([...assets].map(([file, asset]) => [file, asset._id]))
const tx = client.transaction()

for (const item of PROJECTS) {
  const { _id, nodes, related, cover: coverSpec, create, ...fields } = item

  // A project added after the seed has no document to patch yet. Created with its
  // `create` fields first, and only when missing, so a re-run leaves them as edited.
  if (create) tx.createIfNotExists({ _id, _type: 'project', ...create })

  const coverImage = cover(coverSpec)
  const set = {
    ...fields,
    ...(fields.roleDetail ? { roleDetail: keyed('role', fields.roleDetail) } : {}),
    ...(fields.tags ? { tags: keyed('tag', fields.tags) } : {}),
    ...(fields.features ? { features: keyed('feat', fields.features) } : {}),
    ...(fields.learnings ? { learnings: keyed('learn', fields.learnings) } : {}),
    ...(fields.links ? { links: keyed('link', fields.links) } : {}),
    ...(coverImage ? { cover: coverImage } : {}),
    body: forDataset(writeUp(nodes, 'en', refsByFile)),
    bodyZh: forDataset(writeUp(nodes, 'zh', refsByFile)),
    relatedProjects: refs(related),
  }

  const sections = nodes.filter((n) => n.kind === 'block' && n.style === 'h3').length
  const shots = nodes.filter((n) => n.kind === 'image')
  const placed = shots.filter((n) => assets.has(n.file)).length
  const coverNote = coverSpec
    ? coverImage
      ? `cover ${coverSpec.file}`
      : `cover missing (${coverSpec.file} — not uploaded, leaving the old one)`
    : 'no cover'

  console.log(
    `${DRY_RUN ? 'would write' : '→'} ${_id}\n` +
      `    status: ${set.status}  ·  ${sections} sections  ·  ` +
      `${set.body.length} EN blocks / ${set.bodyZh.length} ZH blocks\n` +
      `    lists: ${(set.features ?? []).length} features, ${(set.learnings ?? []).length} learnings` +
      (set.stack ? `, ${set.stack.length} stack` : '') +
      `\n    media: ${coverNote}  ·  ${placed}/${shots.length} screenshots in the write-up` +
      `\n    links: ${(set.links ?? []).map((l) => l.url).join(', ') || 'none'}`
  )

  tx.patch(_id, { set })
}

/* ------------------------------------------------------------------- accounts */

/**
 * The two accounts in the strip under the projects: a summary and a 抖音号, which is
 * the whole of what they have to say. Everything else on those documents — the name,
 * the category, the order they sit in — was set when the site was seeded and is left
 * exactly as it is.
 */
for (const { _id, handles, ...fields } of ACCOUNTS) {
  // Shown whole and small in the strip, so no crop and no hotspot: each one is a
  // finished piece of artwork with its own headline already on it.
  const covers = (ACCOUNT_COVERS[_id] ?? [])
    .map((file, i) => {
      const asset = assets.get(file)
      if (!asset) return null
      return {
        _type: 'image',
        _key: `cover${i}`,
        asset: { _type: 'reference', _ref: asset._id },
        ...(PHOTOS[file]?.alt ? { alt: PHOTOS[file].alt } : {}),
      }
    })
    .filter(Boolean)

  const set = {
    ...fields,
    handles: keyed('handle', handles),
    ...(covers.length > 0 ? { gallery: covers } : {}),
  }
  console.log(
    `${DRY_RUN ? 'would write' : '→'} ${_id}\n` +
      `    ${set.handles.map((h) => `${h.platform} ${h.id}`).join(', ')}` +
      (covers.length > 0 ? `  ·  ${covers.length} cover(s)` : '')
  )
  tx.patch(_id, { set })
}

if (DRY_RUN) {
  console.log('\nDry run. Re-run without --dry-run to write.')
  process.exit(0)
}

await tx.commit()
console.log('\n✓ Written. Four project pages carry their case study, two accounts their 抖音号.')
