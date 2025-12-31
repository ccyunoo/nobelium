import { clientConfig } from '@/lib/server/config'

import { useRouter } from 'next/router'
import cn from 'classnames'
import { getAllPosts, getPostBlocks } from '@/lib/notion'
import { useLocale } from '@/lib/locale'
import { useConfig } from '@/lib/config'
import { createHash } from 'crypto'
import Container from '@/components/Container'
import Post from '@/components/Post'
import Comments from '@/components/Comments'

export default function BlogPost ({ post, blockMap, emailHash }) {
  const router = useRouter()
  const BLOG = useConfig()
  const locale = useLocale()

  // TODO: It would be better to render something
  if (router.isFallback) return null

  const fullWidth = post.fullWidth ?? false

  return (
    <Container
      layout="blog"
      title={post.title}
      description={post.summary}
      slug={post.slug}
      // date={new Date(post.publishedAt).toISOString()}
      type="article"
      fullWidth={fullWidth}
    >
      <Post
        post={post}
        blockMap={blockMap}
        emailHash={emailHash}
        fullWidth={fullWidth}
      />

      {/* Back and Top */}
      <div
        className={cn(
          'px-4 flex justify-between font-medium text-gray-500 dark:text-gray-400 my-5',
          fullWidth ? 'md:px-24' : 'mx-auto max-w-4xl'
        )}
      >
        <a>
          <button
            onClick={() => router.push(BLOG.path || '/')}
            className="mt-2 cursor-pointer hover:text-black dark:hover:text-gray-100"
          >
            ← {locale.POST.BACK}
          </button>
        </a>
        <a>
          <button
            onClick={() => window.scrollTo({
              top: 0,
              behavior: 'smooth'
            })}
            className="mt-2 cursor-pointer hover:text-black dark:hover:text-gray-100"
          >
            ↑ {locale.POST.TOP}
          </button>
        </a>
      </div>

      <Comments frontMatter={post} />
    </Container>
  )
}

export async function getStaticPaths () {
  try {
    const posts = (await getAllPosts({ includePages: true })) || []
    // 保持字符串路径形式以兼容 BLOG.path 的自定义前缀
    const basePath = clientConfig.path || ''
    const paths = posts.map(row => `${basePath}/${row.slug}`)
    return {
      paths,
      fallback: 'blocking'
    }
  } catch (err) {
    console.error('getStaticPaths error:', err)
    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}

export async function getStaticProps ({ params: { slug } }) {
  const posts = (await getAllPosts({ includePages: true })) || []
  const post = posts.find(t => t.slug === slug)

  if (!post) return { notFound: true }

  let blockMap = null
  try {
    blockMap = await getPostBlocks(post.id)
  } catch (e) {
    console.error('getPostBlocks error:', e)
    // 该 slug 对应页面不可访问或拉取失败，返回 404，防止构建报错
    return { notFound: true }
  }

  const emailHash = createHash('md5')
    .update(clientConfig.email)
    .digest('hex')
    .trim()
    .toLowerCase()

  return {
    props: { post, blockMap, emailHash },
    // 缓和再生成频率，可按需调整
    revalidate: 60
  }
}
