import { NextStudio } from 'next-sanity/studio'
import { QuietSanityReconnects } from '@/components/QuietSanityReconnects'
import config from '../../../../../sanity.config'

export const dynamic = 'force-static'

export default function StudioPage() {
  return (
    <>
      <QuietSanityReconnects />
      <NextStudio config={config} />
    </>
  )
}
