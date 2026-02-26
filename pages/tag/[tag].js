import { getAllPosts, getAllTagsFromPosts } from "@/lib/notion";
import SearchLayout from "@/layouts/search";

export default function Tag({ tags, posts, currentTag }) {
  return <SearchLayout tags={tags} posts={posts} currentTag={currentTag} />;
}

export async function getStaticProps({ params }) {
  const currentTag = params.tag;
  const posts = await getAllPosts({ includePages: false });
  const tags = getAllTagsFromPosts(posts);
  const filteredPosts = posts.filter((post) => post && post.tags && post.tags.includes(currentTag));
  return {
    props: {
      tags,
      posts: filteredPosts,
      currentTag,
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  return {
    // Don't pre-render tag pages at build time to avoid Notion rate limits.
    // Pages are generated on-demand on first visit (ISR handles caching).
    paths: [],
    fallback: "blocking",
  };
}
