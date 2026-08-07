import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/sanity/client'

/**
 * Presentation calls this to turn draft mode on. The token is only ever used
 * server-side to validate the request came from an authenticated studio session.
 */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
})
