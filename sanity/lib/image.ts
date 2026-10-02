import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import { client } from './client'

const builder = client ? createImageUrlBuilder(client) : null

export function urlFor(source: SanityImageSource) {
  if (!builder) {
    throw new Error('Sanity is not configured (NEXT_PUBLIC_SANITY_PROJECT_ID)')
  }
  return builder.image(source)
}
