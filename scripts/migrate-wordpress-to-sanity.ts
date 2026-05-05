/**
 * One-off migration: WordPress (WPGraphQL) → Sanity `post` documents.
 *
 * Prerequisites:
 * - .env.local with NEXT_PUBLIC_SANITY_*, SANITY_API_WRITE_TOKEN, WORDPRESS_GRAPHQL_URL
 * - Token: https://www.sanity.io/manage → Project → API → Add API token (Editor)
 *
 * Run: npm run migrate:wordpress
 */

import { createClient, type SanityClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { GraphQLClient, gql } from 'graphql-request'
import { JSDOM } from 'jsdom'
import { htmlToPortableText, buildObjectMatcher } from '@portabletext/html'

loadEnv({ path: resolve(process.cwd(), '.env.local') })

const WP_ENDPOINT =
  process.env.WORDPRESS_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
  'https://cms.rosecrestgroupltd.co.uk/graphql'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01'

const imageMatcher = buildObjectMatcher({
  name: 'image',
  fields: [
    { name: 'src', type: 'string' },
    { name: 'alt', type: 'string' },
    { name: 'title', type: 'string' },
  ],
})

const POSTS_QUERY = gql`
  query MigratePosts($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
        title
        date
        excerpt
        content(format: RENDERED)
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`

type WpPost = {
  slug: string
  title: string
  date: string
  excerpt: string | null
  content: string | null
  featuredImage?: { node: { sourceUrl: string; altText?: string | null } | null } | null
}

type WpResponse = {
  posts?: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    nodes: WpPost[]
  }
}

function key(): string {
  return randomBytes(6).toString('hex')
}

function stripHtml(html: string, maxLen: number): string {
  const text = new JSDOM(html).window.document.body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text
}

/** Sanity datetime expects ISO 8601; WP GraphQL dates can omit timezone. */
function toPublishedAtIso(wpDate: string): string {
  const d = new Date(wpDate)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

type LooseBlock = Record<string, unknown> & { _type?: string; _key?: string; children?: unknown[] }

function spanHasContent(s: Record<string, unknown>): boolean {
  const text = typeof s.text === 'string' ? s.text : ''
  const marks = Array.isArray(s.marks) ? s.marks : []
  return text.trim().length > 0 || marks.length > 0
}

/** Turn mixed text+image paragraphs into Sanity-friendly top-level blocks only. */
function splitBlocksForSanity(blocks: LooseBlock[]): LooseBlock[] {
  const out: LooseBlock[] = []

  for (const block of blocks) {
    if (block._type !== 'block' || !Array.isArray(block.children)) {
      out.push(block)
      continue
    }

    const children = block.children as Record<string, unknown>[]
    const markDefs = Array.isArray(block.markDefs) ? block.markDefs : []

    if (
      children.length === 1 &&
      children[0]._type === 'image' &&
      typeof children[0].src === 'string'
    ) {
      const img = children[0]
      out.push({
        _type: 'image',
        _key: (img._key as string) || key(),
        src: img.src,
        alt: typeof img.alt === 'string' ? img.alt : '',
      })
      continue
    }

    let buf: Record<string, unknown>[] = []

    const flush = () => {
      if (!buf.some(spanHasContent)) {
        buf = []
        return
      }
      out.push({
        ...block,
        _key: key(),
        children: buf.map((c) => ({ ...c, _key: (c._key as string) || key() })),
        markDefs: [...markDefs],
      })
      buf = []
    }

    for (const child of children) {
      if (child._type === 'image' && typeof child.src === 'string') {
        flush()
        out.push({
          _type: 'image',
          _key: (child._key as string) || key(),
          src: child.src,
          alt: typeof child.alt === 'string' ? child.alt : '',
        })
      } else {
        buf.push(child)
      }
    }
    flush()
  }

  return out
}

function htmlToBlocks(html: string): LooseBlock[] {
  const raw = htmlToPortableText(html || '<p></p>', {
    parseHtml: (h) => new JSDOM(h).window.document,
    types: {
      image: imageMatcher,
      inlineImage: imageMatcher,
    } as NonNullable<Parameters<typeof htmlToPortableText>[1]>['types'] & {
      inlineImage: typeof imageMatcher
    },
  }) as LooseBlock[]
  return pruneEmptyBlocks(splitBlocksForSanity(raw))
}

function pruneEmptyBlocks(blocks: LooseBlock[]): LooseBlock[] {
  return blocks.filter((b) => {
    if (b._type !== 'block') return true
    const ch = b.children as Record<string, unknown>[] | undefined
    if (!ch?.length) return false
    return ch.some((c) => c._type !== 'span' || spanHasContent(c))
  })
}

const uploadedByUrl = new Map<string, string>()

async function tryFetchImage(url: string): Promise<{ buf: Buffer; url: string }> {
  const urlsToTry = [url]

  // If main domain fails, try cms subdomain
  if (url.includes('rosecrestgroupltd.co.uk/wp-content/')) {
    urlsToTry.push(url.replace('rosecrestgroupltd.co.uk', 'cms.rosecrestgroupltd.co.uk'))
  }
  // Also try without -WxH suffix (WordPress image sizes)
  const sizeMatch = url.match(/-\d+x\d+(\.[a-z]+)$/i)
  if (sizeMatch) {
    const fullSizeUrl = url.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1')
    if (!urlsToTry.includes(fullSizeUrl)) urlsToTry.push(fullSizeUrl)
    if (fullSizeUrl.includes('rosecrestgroupltd.co.uk/wp-content/')) {
      urlsToTry.push(fullSizeUrl.replace('rosecrestgroupltd.co.uk', 'cms.rosecrestgroupltd.co.uk'))
    }
  }

  for (const tryUrl of urlsToTry) {
    const res = await fetch(tryUrl)
    if (res.ok) {
      return { buf: Buffer.from(await res.arrayBuffer()), url: tryUrl }
    }
  }

  throw new Error(`Image fetch failed 404 (tried ${urlsToTry.length} URLs): ${url}`)
}

async function uploadImageFromUrl(client: SanityClient, url: string): Promise<string> {
  const normalized = url.split('#')[0]
  const cached = uploadedByUrl.get(normalized)
  if (cached) return cached

  const { buf, url: fetchedUrl } = await tryFetchImage(normalized)

  let filename = 'image.jpg'
  try {
    const u = new URL(fetchedUrl)
    const base = decodeURIComponent(u.pathname.split('/').pop() || '')
    if (base) filename = base.split('?')[0] || filename
  } catch {
    /* keep default */
  }

  const asset = await client.assets.upload('image', buf, { filename })
  uploadedByUrl.set(normalized, asset._id)
  return asset._id
}

async function resolveImageAssets(client: SanityClient, blocks: LooseBlock[]): Promise<LooseBlock[]> {
  const out: LooseBlock[] = []
  for (const b of blocks) {
    if (b._type === 'image' && typeof b.src === 'string') {
      try {
        const ref = await uploadImageFromUrl(client, b.src)
        out.push({
          _type: 'image',
          _key: (b._key as string) || key(),
          asset: { _type: 'reference', _ref: ref },
          alt: typeof b.alt === 'string' ? b.alt : '',
        })
      } catch (imgErr) {
        console.warn(`  ⚠ body image skipped (${imgErr instanceof Error ? imgErr.message : imgErr})`)
      }
    } else {
      out.push(b)
    }
  }
  return out
}

function importDocId(slug: string): string {
  const safe = slug.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 90) || 'post'
  return `import.wp.${safe}`
}

async function fetchAllPosts(client: GraphQLClient): Promise<WpPost[]> {
  const all: WpPost[] = []
  let after: string | null = null
  let hasNext = true

  while (hasNext) {
    const data: WpResponse = await client.request<WpResponse>(POSTS_QUERY, {
      first: 50,
      after,
    })
    const conn: WpResponse['posts'] = data.posts
    if (!conn) break
    all.push(...conn.nodes)
    hasNext = conn.pageInfo.hasNextPage
    after = conn.pageInfo.endCursor
  }

  return all
}

async function main() {
  if (!projectId || !token) {
    console.error(
      'Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local',
    )
    process.exit(1)
  }

  const gqlClient = new GraphQLClient(WP_ENDPOINT)
  const sanity = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })

  console.log(`Fetching posts from: ${WP_ENDPOINT}`)
  const posts = await fetchAllPosts(gqlClient)
  console.log(`Found ${posts.length} published posts.`)

  for (const post of posts) {
    const slug = post.slug
    const docId = importDocId(slug)
    try {
      let heroImage: Record<string, unknown> | undefined
      const src = post.featuredImage?.node?.sourceUrl
      if (src) {
        try {
          const ref = await uploadImageFromUrl(sanity, src)
          heroImage = {
            _type: 'image',
            asset: { _type: 'reference', _ref: ref },
            alt: post.featuredImage?.node?.altText || post.title,
          }
        } catch (imgErr) {
          console.warn(`  ⚠ heroImage skipped (${imgErr instanceof Error ? imgErr.message : imgErr})`)
        }
      }

      const blocks = htmlToBlocks(post.content ?? '')
      const body = await resolveImageAssets(sanity, blocks)

      const excerptPlain = post.excerpt ? stripHtml(post.excerpt, 300) : ''

      const doc = {
        _id: docId,
        _type: 'post' as const,
        title: post.title,
        slug: { _type: 'slug' as const, current: slug },
        excerpt: excerptPlain || undefined,
        heroImage,
        body,
        publishedAt: toPublishedAtIso(post.date),
        seo: {
          metaTitle: post.title,
          metaDescription: excerptPlain.slice(0, 200) || undefined,
        },
      }

      await sanity.createOrReplace(doc)
      console.log(`OK  ${slug}`)
    } catch (e) {
      console.error(`FAIL ${slug}:`, e instanceof Error ? e.message : e)
    }
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
