import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { DisableDraftMode } from '@/components/DisableDraftMode'
import { SanityLive } from '@/sanity/live'

import '@/styles/tokens.css'
import '@/styles/ui-kit.css'
import '@/styles/site.css'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: isDraft } = await draftMode()

  return (
    <>
      {children}
      <SanityLive />
      {isDraft && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </>
  )
}
