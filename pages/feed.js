import { getAllPosts } from '@/lib/notion'
import { generateRss } from '@/lib/rss'
export async function getServerSideProps ({ res }) {
  res.setHeader('Content-Type', 'text/xml')
  try {
    const posts = await getAllPosts({ includePages: false })
    const latestPosts = posts.slice(0, 10)
    const xmlFeed = await generateRss(latestPosts)
    res.write(xmlFeed)
    res.end()
  } catch (err) {
    console.error('Failed to generate /feed:', err)
    const xmlFeed = await generateRss([])
    res.write(xmlFeed)
    res.end()
  }
  return {
    props: {}
  }
}
const feed = () => null
export default feed
