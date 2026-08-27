import { NextStudio } from 'next-sanity/studio'
import { QuietSanityReconnects } from '@/components/QuietSanityReconnects'
import config from '../../../../sanity.config'

export const dynamic = 'force-static'
export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return (
    <>
      <QuietSanityReconnects />
      <NextStudio config={config} />
    </>
  )
}
