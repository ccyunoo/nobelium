import { clientConfig } from '@/lib/server/config'
import Container from '@/components/Container'
import BlogPost from '@/components/BlogPost'
import Pagination from '@/components/Pagination'
import { getAllPosts } from '@/lib/notion'
import { useConfig } from '@/lib/config'

export async function getStaticProps() {
  const posts = await getAllPosts({ includePages: false })
  const postsToShow = posts.slice(0, clientConfig.postsPerPage)
  const totalPosts = posts.length
  const showNext = totalPosts > clientConfig.postsPerPage

  // 收集所有标签并统计数量
  const tagCount = {}
  posts.forEach(post => {
    post.tags?.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })
  const tags = Object.entries(tagCount).map(([name, count]) => ({ name, count }))

  return {
    props: {
      page: 1,
      postsToShow,
      showNext,
      tags
    },
    revalidate: 1
  }
}

export default function Blog({ postsToShow, page, showNext, tags }) {
  const { title, description } = useConfig()

  return (
    <Container title={title} description={description}>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-3/4">
          {postsToShow.map(post => (
            <BlogPost key={post.id} post={post} />
          ))}
          {showNext && <Pagination page={page} showNext={showNext} />}
        </div>
        
        <div className="md:w-1/4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4">标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <a
                  key={tag.name}
                  href={`/tag/${tag.name}`}
                  className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 
                           rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600
                           transition-colors"
                >
                  {tag.name} ({tag.count})
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}