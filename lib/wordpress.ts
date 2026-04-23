import { GraphQLClient } from "graphql-request";

function getClient() {
  const endpoint = "https://cms.rosecrestgroupltd.co.uk/graphql";

  return new GraphQLClient(endpoint);
}

interface AllPostsResponse {
  posts?: {
    nodes: {
      slug: string;
      title: string;
      date: string;
      excerpt: string;
      featuredImage?: {
        node: { sourceUrl: string; altText?: string };
      } | null;
    }[];
  };
}

interface PostBySlugResponse {
  postBy?: {
    title: string;
    date: string;
    content: string;
    featuredImage?: {
      node: { sourceUrl: string; altText?: string };
    } | null;
  } | null;
}

export async function getAllPosts() {
  const query = `
    query {
      posts(first: 100, where: { status: PUBLISH }) {
        nodes {
          slug
          title
          date
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `;

  const data = await getClient().request<AllPostsResponse>(query);
  return data?.posts?.nodes ?? [];
}

export async function getPostBySlug(slug: string) {
  const query = `
    query GetPost($slug: String!) {
      postBy(slug: $slug) {
        title
        date
        content
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  `;

  const data = await getClient().request<PostBySlugResponse>(query, { slug });
  return data?.postBy ?? null;
}
