'use client'

import { useState } from 'react'
import type { ResolvedVideo } from '@/lib/video'

/**
 * Plays a video, without paying for it until someone wants to watch.
 *
 * An embedded YouTube player pulls several hundred KB of script and sets cookies
 * on page load, whether or not anyone presses play. This renders a poster and a
 * button instead, and only mounts the iframe on the first click — so a page with a
 * video on it costs an image until the video is actually wanted.
 */
export function VideoPlayer({
  video,
  poster,
  title,
}: {
  video: ResolvedVideo
  poster?: string | null
  title?: string
}) {
  const [playing, setPlaying] = useState(false)

  if (!video) return null

  if (video.kind === 'file') {
    return (
      <video className="video-frame" controls preload="metadata" poster={poster ?? undefined}>
        <source src={video.src} />
      </video>
    )
  }

  const still = poster ?? video.thumbnail

  if (!playing) {
    return (
      <button
        type="button"
        className="video-facade"
        onClick={() => setPlaying(true)}
        aria-label={title ? `Play ${title}` : 'Play video'}
        style={still ? { backgroundImage: `url(${still})` } : undefined}
      >
        <span className="video-play" aria-hidden>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    )
  }

  return (
    <iframe
      className="video-frame"
      src={`${video.src}${video.src.includes('?') ? '&' : '?'}autoplay=1`}
      title={title ?? 'Video'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  )
}
