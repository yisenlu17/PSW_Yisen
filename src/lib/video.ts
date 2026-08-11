import { stegaClean } from 'next-sanity'

export type VideoEmbedData = {
  source?: string | null
  url?: string | null
  file?: { asset?: { url?: string | null } | null } | null
  poster?: unknown
  title?: { en?: string | null; zh?: string | null } | null
  caption?: { en?: string | null; zh?: string | null } | null
}

export type ResolvedVideo =
  | { kind: 'iframe'; src: string; thumbnail: string | null }
  | { kind: 'file'; src: string }
  | null

/**
 * Works the embed URL out from whatever link was pasted.
 *
 * Editors paste watch pages, short links, and links with a `t=` timestamp on them;
 * none of those are embeddable as-is. Anything unrecognised resolves to null and
 * the player renders nothing, rather than an iframe pointed at a 404.
 */
export function resolveVideo(video: VideoEmbedData | null | undefined): ResolvedVideo {
  if (!video) return null

  const source = stegaClean(video.source ?? '')

  if (source === 'file') {
    const src = video.file?.asset?.url
    return src ? { kind: 'file', src: stegaClean(src) } : null
  }

  const url = video.url ? stegaClean(video.url) : ''
  if (!url) return null

  if (source === 'youtube') {
    const id =
      url.match(/[?&]v=([\w-]{6,})/)?.[1] ??
      url.match(/youtu\.be\/([\w-]{6,})/)?.[1] ??
      url.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1]

    if (!id) return null
    return {
      kind: 'iframe',
      // youtube-nocookie avoids setting tracking cookies until playback starts.
      src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    }
  }

  if (source === 'vimeo') {
    const id = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]
    if (!id) return null
    return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}`, thumbnail: null }
  }

  return null
}
