import api from '@/lib/server/notion-api'
import normalizeRecordMap from './normalizeRecordMap'

export async function getPostBlocks (id) {
  try {
    const pageBlock = await api.getPage(id)
    return normalizeRecordMap(pageBlock)
  } catch (err) {
    const status = err?.status ?? err?.response?.status
    if (status === 403) {
      console.error(
        `Failed to fetch Notion page blocks "${id}" (403). Ensure the page is shared to web, or set NOTION_ACCESS_TOKEN (token_v2) with permission.`
      )
      return null
    }
    console.error(`Failed to fetch Notion page blocks "${id}":`, err)
    return null
  }
}
