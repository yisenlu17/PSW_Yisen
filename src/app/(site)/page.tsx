import type { Metadata } from 'next'
import { renderPage, pageMetadata } from '@/lib/render-page'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('/')

export default function HomePage() {
  return renderPage('/')
}
