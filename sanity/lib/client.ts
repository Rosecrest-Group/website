import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

/**
 * Server-only token so the app can read private datasets (Studio is logged in;
 * the public API is not). Prefer SANITY_API_READ_TOKEN; write token works but
 * should never be exposed as NEXT_PUBLIC_*.
 */
const readToken =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  /** CDN ignores auth — disable whenever we send a token */
  useCdn: process.env.NODE_ENV === 'production' && !readToken,
  token: readToken || undefined,
})

/** Sanity queries wired into Next.js Data Cache (matches `export const revalidate` on routes). */
export function sanityFetch<Response>(
  query: string,
  params: Record<string, unknown> = {},
) {
  return client.fetch<Response>(query, params, {
    next: { revalidate: 60 },
  })
}
