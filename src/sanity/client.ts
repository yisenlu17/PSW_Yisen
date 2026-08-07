import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  // Encodes field paths into strings during preview so clicking rendered text can
  // open the field that produced it. Off outside preview so production ships clean.
  stega: { studioUrl: '/studio' },
})
