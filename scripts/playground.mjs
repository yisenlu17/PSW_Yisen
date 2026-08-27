/**
 * Writes the Playground page.
 *
 * Three things, all of them decided in `photo-content.mjs`; this is only transport.
 *
 *   · Two of the bento tiles become photographs rather than coloured panels.
 *   · Every tile is given the size its own text fills, and they are written in an
 *     order the grid can pack, so no cell is left holding nothing.
 *   · The gallery of weekends goes in above the closing CTA.
 *
 *   SANITY_API_WRITE_TOKEN=... npm run playground
 *   npm run playground -- --dry-run    # print, change nothing
 *
 * The token can also live in .env.local, or come from `npx sanity login` — see
 * sanity-write.mjs.
 *
 * It reads the page as it is and writes it back with those changes made, so a
 * section added in the studio is left where it is and a tile renamed there is
 * reported rather than silently missed. Re-running is safe: the gallery carries a
 * fixed key, so a second run replaces the one already there instead of adding a
 * second copy.
 *
 * The photographs on the two role pages are not here — a contribution's picture goes
 * in with the words it belongs to, which `npm run experience-detail` writes.
 */
import { writeClient } from './sanity-write.mjs'
import { PHOTOS, BENTO_PHOTOS, BENTO_LAYOUT, BENTO_COPY, GALLERY, photoFiles } from './photo-content.mjs'

const DRY_RUN = process.argv.includes('--dry-run')
const client = writeClient('npm run playground', { needsWrite: !DRY_RUN })

const PAGE = 'page.playground'

/* --------------------------------------------------------------------- assets */

const assets = new Map(
  (
    await client.fetch(
      `*[_type == "sanity.imageAsset" && originalFilename in $files]
        | order(_createdAt asc)
        { _id, originalFilename }`,
      { files: photoFiles().map((p) => p.file) }
    )
  ).map((asset) => [asset.originalFilename, asset._id])
)

/**
 * The picture as a document writes it: the asset, its description, and the hotspot
 * where one is worth setting. Nothing uploaded yet returns null, and the caller
 * leaves that slot as it found it rather than writing a hole.
 */
function image(file) {
  const asset = assets.get(file)
  if (!asset) return null
  const photo = PHOTOS[file]
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset },
    ...(photo.alt ? { alt: photo.alt } : {}),
    ...(photo.hotspot ? { hotspot: { _type: 'sanity.imageHotspot', ...photo.hotspot } } : {}),
  }
}

/* ----------------------------------------------------------------------- page */

const page = await client.fetch(`*[_id == $id][0]{ _id, sections }`, { id: PAGE })
if (!page) {
  console.error(`✗ ${PAGE} is not in this dataset. Run \`npm run seed\` first.`)
  process.exit(1)
}

const notes = []
const sections = (page.sections ?? []).map((section) => {
  if (section._type !== 'bentoGridSection') return section

  const layout = new Map(BENTO_LAYOUT.map((tile, i) => [tile.key, { ...tile, at: i }]))

  const tiles = (section.tiles ?? []).map((tile) => {
    const next = { ...tile, ...BENTO_COPY[tile._key] }
    const changed = Object.keys(BENTO_COPY[tile._key] ?? {})

    const size = layout.get(tile._key)?.size
    if (size && size !== tile.size) {
      changed.push(`${tile.size}→${size}`)
      next.size = size
    }

    const file = BENTO_PHOTOS[tile._key]
    if (file) {
      const picture = image(file)
      if (picture) {
        next.image = picture
        changed.push(file)
      } else {
        notes.push(`⚠ bento ${tile._key}: ${file} is not uploaded — left as it was`)
      }
    }

    if (changed.length > 0) notes.push(`bento ${tile._key}: ${changed.join(', ')}`)
    return next
  })

  for (const key of Object.keys(BENTO_PHOTOS)) {
    if (!tiles.some((tile) => tile._key === key)) {
      notes.push(`⚠ no tile called "${key}" on this page — its photograph has nowhere to go`)
    }
  }

  // Sizes flow rather than being placed, so the order they are written in is what
  // decides whether they pack tightly or leave a cell empty in the middle.
  const rank = (tile) => layout.get(tile._key)?.at ?? layout.size
  const packed = [...tiles].sort((a, b) => rank(a) - rank(b))
  notes.push(`bento: ${packed.map((t) => `${t._key}(${t.size})`).join(' → ')}`)

  return { ...section, tiles: packed }
})

/* -------------------------------------------------------------------- gallery */

const { photos, before, ...galleryFields } = GALLERY
const shots = photos.map((file, i) => {
  const picture = image(file)
  return picture ? { ...picture, _key: `photo${i}`, caption: PHOTOS[file].caption } : null
}).filter(Boolean)

if (shots.length === 0) {
  notes.push('⚠ none of the gallery photographs are uploaded — the gallery is not written')
} else {
  const gallery = { ...galleryFields, photos: shots }
  notes.push(`gallery: ${shots.length} photograph(s), ${gallery.variant}`)

  const at = sections.findIndex((s) => s._key === GALLERY._key)
  if (at >= 0) {
    sections[at] = gallery
  } else {
    // Above the closing CTA — that section is the last thing on every page, and a
    // gallery under it reads as an afterthought bolted on below the goodbye.
    const cta = sections.findIndex((s) => s._key === before)
    sections.splice(cta >= 0 ? cta : sections.length, 0, gallery)
  }
}

/* ---------------------------------------------------------------------- write */

console.log(`${DRY_RUN ? 'would write' : '→'} ${PAGE}`)
for (const note of notes) console.log(`    ${note}`)
console.log(`    sections: ${sections.map((s) => s._key).join(' → ')}`)

if (DRY_RUN) {
  console.log('\nDry run. Re-run without --dry-run to write.')
  process.exit(0)
}

await client.patch(PAGE).set({ sections }).commit()
console.log('\n✓ Written. The Playground page carries its photographs and its gallery.')
