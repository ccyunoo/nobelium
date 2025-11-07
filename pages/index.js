import { clientConfig } from '@/lib/server/config'
import Container from '@/components/Container'
import BlogPost from '@/components/BlogPost'
import Pagination from '@/components/Pagination'
import { getAllPosts } from '@/lib/notion'
import { useConfig } from '@/lib/config'

export async function getStaticProps() {
  const posts = await getAllPosts({ includePages: false })

  //原首页显示全部数据 postsToShow 改成filteredPostsToShow 就过滤了 tag为newsletter的数据 
  //  const postsToShow = posts.slice(0, clientConfig.postsPerPage) 
  // 只在显示文章列表时过滤 newsletter
  const filteredPostsToShow = posts
    .filter(post => !post.tags?.includes('newsletter'))
    .slice(0, clientConfig.postsPerPage)
    
  const totalPosts = posts.filter(post => !post.tags?.includes('newsletter')).length
  const showNext = totalPosts > clientConfig.postsPerPage
  // 收集所有标签并统计数量
  const tagCount = {}
  posts.forEach(post => {
    post.tags?.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })
  const tags = Object.entries(tagCount).map(([name, count]) => ({ name, count }))

  // 添加专题数据
  const topics = [
    { name: 'AILAB', url: 'http://1photo1month.com/lab/', description: 'xiaoyun的AI实验室' },
    { name: '月图', url: 'http://1photo1month.com/', description: '一月一图记录生活' },
    { name: '写诗', url: 'http://1photo1month.com/lab/poetry/', description: '写字诗词字帖' },
    { name: '放空', url: 'http://1photo1month.com/lab/peace/', description: '简单轻音乐' },
    { name: '花开', url: 'https://1photo1month.com/p_paintings.php?image_id=368', description: '收集暖心的花朵' },
    { name: '有意思的人', url: 'https://www.ccyun.com/bloger', description: '分享友链  ' }
    
    // 可以继续添加更多专题
  ]

  return {
    props: {
      page: 1,
      postsToShow: filteredPostsToShow,  // 使用过滤后的文章列表。postsToShow,这样写就是显示全部的 
      showNext,
      tags,
      topics  // 添加到props中
    },
    revalidate: 1
  }
}
export default function Blog({ postsToShow, page, showNext, tags, topics }) {
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
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">  {/* 添加 mb-4 边距 */}
            <h3 className="text-xl font-bold mb-4">Tags</h3>
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

          {/* 添加专题模块 */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Topics</h3>
            <div className="flex flex-col gap-3">
              {topics.map(topic => (
                <a
                  key={topic.name}
                  href={topic.url}
                  className="block p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {topic.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {topic.description}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}