import { createImageUrlBuilder } from '@sanity/image-url'
import { stegaClean } from 'next-sanity'
import type { Image } from 'sanity'
import { dataset, projectId } from './env'

const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: Image) => builder.image(source).auto('format').fit('max')

/**
 * The same picture, cropped to a shape the design owns.
 *
 * `urlFor` fits inside the box it is given, which is right for a screenshot shown
 * whole. A square tile or a 4:3 panel is the other case: the shape is fixed, so the
 * crop is better done here than by `object-fit`. Doing it here is what makes the
 * hotspot set in the studio mean something — CSS crops from the middle and cannot be
 * told otherwise — and it stops the browser downloading the half of a photograph that
 * is about to be hidden.
 */
export const cropFor = (source: Image, width: number, height: number) =>
  builder.image(source).auto('format').fit('crop').width(width).height(height)

/** A Sanity asset id ends `-<width>x<height>-<format>`: the size is in the id itself. */
const REF_SIZE = /-(\d+)x(\d+)-[a-z]+$/

/**
 * The picture's own dimensions, for `next/image` to reserve space with.
 *
 * These are screenshots and no two are the same shape, so one fixed pair of numbers
 * would either letterbox the image or make the page jump as it loads. The asset id
 * already carries the real ones, which beats projecting `asset->metadata` into every
 * query that touches an image. Spread it onto the element:
 * `<Image {...imageSize(cover)} … />`.
 */
export function imageSize(
  source?: { asset?: { _ref?: string | null } | null } | null,
  fallback = { width: 1600, height: 1000 }
): { width: number; height: number } {
  const ref = source?.asset?._ref
  const match = ref ? stegaClean(ref).match(REF_SIZE) : null
  return match ? { width: Number(match[1]), height: Number(match[2]) } : fallback
}
