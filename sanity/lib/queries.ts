import { groq } from 'next-sanity'

export const allPostsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    heroImage,
    "author": author->{name, "slug": slug.current},
    "categories": categories[]->{ title, "slug": slug.current }
  }
`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    heroImage,
    body,
    seo,
    "author": author->{name, bio, avatar, "slug": slug.current},
    "categories": categories[]->{ title, "slug": slug.current }
  }
`

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`
