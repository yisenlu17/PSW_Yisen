import type { Metadata } from 'next'
import '@/styles/fonts.css'

export const metadata: Metadata = {
  title: 'Yisen Lu',
  description: 'Product, business and the part where things get built.',
}

/**
 * Root layout stays bare: the studio and the site want very different chrome, so
 * each brings its own in a nested layout. Only the font faces are shared.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
