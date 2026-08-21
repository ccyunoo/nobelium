import api from '@/lib/server/notion-api'
import normalizeRecordMap from './normalizeRecordMap'

export async function getPostBlocks (id) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const pageBlock = await api.getPage(id)
      return normalizeRecordMap(pageBlock)
    } catch (err) {
      const status = err?.status ?? err?.response?.status
      if (status === 429 && attempt < 2) {
        const delay = 1000 * (attempt + 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      if (status === 403) {
        console.error(
          `Failed to fetch Notion page blocks "${id}" (403). Ensure the page is shared to web or configure a valid token_v2.`
        )
      } else {
        console.error(`Failed to fetch Notion page blocks "${id}":`, err)
      }
      return null
    }
  }
}
