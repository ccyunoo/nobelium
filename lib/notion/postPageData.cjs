async function getPostPageData (slug, getAllPosts, getPostBlocks) {
  const posts = await getAllPosts({ includePages: true })
  const post = posts.find(item => item.slug === slug)
  if (!post) return null
  const blockMap = await getPostBlocks(post.id)
  if (!blockMap?.block?.[post.id]) {
    throw new Error(`Notion returned incomplete blocks for post "${post.id}"`)
  }
  return { post, blockMap }
}
module.exports = { getPostPageData }
