import { config as BLOG } from '@/lib/server/config'

import { idToUuid } from 'notion-utils'
import dayjs from 'dayjs'
import api from '@/lib/server/notion-api'
import getAllPageIds from './getAllPageIds'
import getPageProperties from './getPageProperties'
import filterPublishedPosts from './filterPublishedPosts'

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */
export async function getAllPosts ({ includePages = false }) {
  const id = idToUuid(process.env.NOTION_PAGE_ID)

  const response = await api.getPage(id)

  if (!response || !response.collection) {
    console.log('No response or collection data found')
    return []
  }

  const collection = Object.values(response.collection)[0]?.value
  if (!collection) {
    console.log('No collection value found')
    return []
  }

  const collectionQuery = response.collection_query
  const block = response.block
  const schema = collection?.schema

  if (!schema) {
    console.log('No schema found in collection')
    return []
  }

  const rawMetadata = block[id].value

  // Check Type
  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.log(`pageId "${id}" is not a database`)
    return null
  } else {
    // Construct Data
    const pageIds = getAllPageIds(collectionQuery)
    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]
      if (!block[id] || !block[id].value) {
        console.log(`Skip invalid block: ${id}`)
        continue
      }
      const properties = (await getPageProperties(id, block, schema)) || null
      if (!properties) {
        console.log(`Skip post with no properties: ${id}`)
        continue
      }

      // Add fullwidth to properties
      properties.fullWidth = block[id].value?.format?.page_full_width ?? false
      // Convert date (with timezone) to unix milliseconds timestamp
      properties.date = (
        properties.date?.start_date
          ? dayjs.tz(properties.date?.start_date)
          : dayjs(block[id].value?.created_time)
      ).valueOf()

      data.push(properties)
    }

    // remove all the the items doesn't meet requirements
    const posts = filterPublishedPosts({ posts: data, includePages })

    // Sort by date
    if (BLOG.sortByDate) {
      posts.sort((a, b) => b.date - a.date)
    }
    return posts
  }
}
