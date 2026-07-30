/**
 * notion-client v7 wraps every record in an extra {role, value} envelope.
 * Normalize so downstream code works unchanged.
 * v6: recordMap.block[id] = { role, value: { type, ... } }
 * v7: recordMap.block[id] = { role, value: { role, value: { type, ... } } }
 */
export function normalizeRecord(record) {
  if (!record) return record
  const val = record.value
  if (val && typeof val === 'object' && 'value' in val && 'role' in val) {
    return { ...record, value: val.value }
  }
  return record
}

export default function normalizeRecordMap(response) {
  if (!response) return response
  const result = { ...response }
  for (const key of ['block', 'collection', 'collection_view', 'notion_user']) {
    if (response[key]) {
      result[key] = {}
      for (const [id, record] of Object.entries(response[key])) {
        result[key][id] = normalizeRecord(record)
      }
    }
  }
  return result
}
