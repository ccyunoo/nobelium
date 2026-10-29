import api from '@/lib/server/notion-api'
import normalizeRecordMap from './normalizeRecordMap'
import { withNotionRetry } from './retry.cjs'

export async function getPostBlocks (id) {
  const pageBlock = await withNotionRetry(() => api.getPage(id))
  return normalizeRecordMap(pageBlock)
}
