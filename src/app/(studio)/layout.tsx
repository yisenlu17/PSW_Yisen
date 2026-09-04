import '@/styles/fonts.css'

export { metadata, viewport } from 'next-sanity/studio'

/**
 * The studio's own root.
 *
 * It exists because the site's root layout moved under `[locale]` to get at the
 * language, and `/studio` has no language segment — it is one application, in
 * English, that happens to be served from this domain. Sharing a `<body>` with the
 * site would also mean sharing the site's stylesheets, which the studio does not
 * want.
 */
export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
