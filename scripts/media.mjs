/**
 * Puts the pictures in the dataset.
 *
 * Everything the site shows is a file under `media/`, named by a content module —
 * `project-content.mjs` for the screenshots, `photo-content.mjs` for the
 * photographs. This uploads exactly what those two ask for and stops there: it
 * writes no document, so a wrong picture is a file to replace rather than a page to
 * repair. `npm run project-detail`, `npm run playground` and `npm run experience-detail`
 * are what then point the pages at them.
 *
 * The folders under `media/` are for finding things by hand, not for the scripts: a
 * name in a content module is looked for in every one of them, so moving a file
 * between folders changes nothing and the same file can be used in two places.
 *
 *   npm run media
 *   npm run media -- --dry-run    # say what would go up, upload nothing
 *   npm run media -- --replace    # upload again even if the name is taken
 *
 * Re-running is safe. An asset already in the dataset under the same filename is
 * reused, and Sanity stores one asset per set of bytes anyway, so the same screenshot
 * uploaded twice is the same asset both times. `--replace` is for the case that beats
 * both of those: a screenshot that was retaken and kept its name.
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'

import { writeClient, root } from './sanity-write.mjs'
import { mediaFiles } from './project-content.mjs'
import { photoFiles } from './photo-content.mjs'

const DRY_RUN = process.argv.includes('--dry-run')
const REPLACE = process.argv.includes('--replace')
const MEDIA = join(root, 'media')

/**
 * Where a named file actually is.
 *
 * One flat namespace over the folders: `media/photos/basketball.jpg` is asked for as
 * `basketball.jpg`, so the folders can be reorganised without every content module
 * hearing about it. A name found twice is a name to change — the dataset keys assets
 * by filename too, so two files called the same thing cannot both be pointed at.
 */
const byName = new Map()
for (const entry of readdirSync(MEDIA, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  for (const file of readdirSync(join(MEDIA, entry.name))) {
    const path = join(MEDIA, entry.name, file)
    const seen = byName.get(file)
    if (seen && seen !== path) {
      console.error(`✗ two files are called ${file}:`)
      console.error(`    ${seen}\n    ${path}`)
      console.error('  Rename one — a picture is looked up by its name alone.')
      process.exit(1)
    }
    byName.set(file, path)
  }
}

const find = (file) => byName.get(file) ?? join(MEDIA, file)

const TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

const client = writeClient('npm run media', { needsWrite: !DRY_RUN })

/* --------------------------------------------------------------- what is asked */

/** One row per file, carrying every place that file is used. */
const wanted = new Map()
const remember = (file, use) => {
  const row = wanted.get(file) ?? { file, uses: [] }
  row.uses.push(use)
  wanted.set(file, row)
}

for (const use of mediaFiles()) {
  remember(use.file, `${use.project.replace(/^project\./, '')} ${use.role}`)
}
for (const photo of photoFiles()) {
  for (const use of photo.uses) remember(photo.file, use)
}

const rows = [...wanted.values()]
const missing = rows.filter((r) => !existsSync(find(r.file)))

if (missing.length > 0) {
  console.error(`✗ ${missing.length} file(s) named in a content module are not under media/:`)
  for (const row of missing) console.error(`    ${row.file}   (${row.uses.join(', ')})`)
  console.error('\n  Save the screenshot under that exact name and re-run.')
  if (missing.length === rows.length) process.exit(1)
  console.error('  Carrying on with the rest.\n')
}

const present = rows.filter((r) => existsSync(find(r.file)))

/* ------------------------------------------------------------- what is already */

const existing = new Map(
  (
    await client.fetch(
      `*[_type == "sanity.imageAsset" && originalFilename in $files]
        | order(_createdAt asc)
        { _id, originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height }`,
      { files: present.map((r) => r.file) }
    )
  ).map((asset) => [asset.originalFilename, asset])
)

/* ---------------------------------------------------------------------- upload */

const kb = (n) => `${Math.round(n / 1024)} KB`

for (const row of present) {
  const path = find(row.file)
  const known = existing.get(row.file)

  if (known && !REPLACE) {
    console.log(`= ${row.file}\n    already in the dataset — ${known.w}×${known.h}  ·  ${known._id}`)
    continue
  }

  const contentType = TYPES[extname(row.file).toLowerCase()]
  if (!contentType) {
    console.error(`✗ ${row.file}: not an image this script knows how to send.`)
    continue
  }

  if (DRY_RUN) {
    console.log(`would upload ${row.file}  ·  ${kb(statSync(path).size)}  ·  ${row.uses.join(', ')}`)
    continue
  }

  const asset = await client.assets.upload('image', readFileSync(path), {
    filename: row.file,
    contentType,
  })
  const { width, height } = asset.metadata?.dimensions ?? {}
  console.log(`↑ ${row.file}\n    ${width}×${height}  ·  ${kb(asset.size)}  ·  ${asset._id}`)
}

console.log(
  DRY_RUN
    ? '\nDry run. Re-run without --dry-run to upload.'
    : '\n✓ Uploaded. `npm run project-detail`, `npm run playground` and `npm run experience-detail` point the pages at them.'
)
