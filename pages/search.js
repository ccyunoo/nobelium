import { getAllPosts, getAllTagsFromPosts } from '@/lib/notion'
import SearchLayout from '@/layouts/search'

export default function search ({ tags, posts }) {
  return <SearchLayout tags={tags} posts={posts} />
}
export async function getStaticProps () {
  const allPages = await getAllPosts({ includePages: true })
  const posts = allPages.filter(post => post.type?.[0] === 'Post')
  // next-sitemap reads this build snapshot so on-demand articles remain discoverable.
  const sitemapSlugs = allPages.map(post => post.slug)
  const tags = getAllTagsFromPosts(posts)
  return {
    props: {
      tags,
      posts,
      sitemapSlugs
    },
    revalidate: 1
  }
}
