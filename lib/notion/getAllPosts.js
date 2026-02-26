import { config as BLOG } from "@/lib/server/config";

import { idToUuid } from "notion-utils";
import dayjs from "dayjs";
import api from "@/lib/server/notion-api";
import getAllPageIds from "./getAllPageIds";
import getPageProperties from "./getPageProperties";
import filterPublishedPosts from "./filterPublishedPosts";

/**
 * notion-client v7 wraps every record in an extra {role, value} envelope.
 * Normalize so downstream code works unchanged.
 * v6: recordMap.block[id] = { role, value: { type, ... } }
 * v7: recordMap.block[id] = { role, value: { role, value: { type, ... } } }
 */
function normalizeRecord(record) {
  if (!record) return record;
  const val = record.value;
  if (val && typeof val === "object" && "value" in val && "role" in val) {
    return { ...record, value: val.value };
  }
  return record;
}

function normalizeRecordMap(response) {
  if (!response) return response;
  const result = { ...response };
  for (const key of ["block", "collection", "collection_view", "notion_user"]) {
    if (response[key]) {
      result[key] = {};
      for (const [id, record] of Object.entries(response[key])) {
        result[key][id] = normalizeRecord(record);
      }
    }
  }
  return result;
}

/**
 * Module-level cache to deduplicate Notion API calls within a single build.
 * Next.js SSG runs all getStaticProps/getStaticPaths in the same Node process,
 * so this cache lets us make only ONE request to Notion per build regardless
 * of how many pages call getAllPosts() concurrently.
 * TTL is short (30s) so dev server always gets fresh data.
 */
let _cachedPosts = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

// In-flight promise to prevent concurrent fetches (thundering herd)
let _fetchPromise = null;

async function fetchAllPostsFromNotion() {
  if (!process.env.NOTION_PAGE_ID) {
    console.log("NOTION_PAGE_ID is not set, skipping Notion fetch");
    return null;
  }
  const id = idToUuid(process.env.NOTION_PAGE_ID);

  const rawResponse = await api.getPage(id);
  const response = normalizeRecordMap(rawResponse);

  if (!response || !response.collection) {
    console.log("No response or collection data found");
    return null;
  }

  const collection = Object.values(response.collection)[0]?.value;
  if (!collection) {
    console.log("No collection value found");
    return null;
  }

  const collectionQuery = response.collection_query;
  const block = response.block;
  const schema = collection?.schema;

  if (!schema) {
    console.log("No schema found in collection");
    return null;
  }

  const rawMetadata = block[id].value;
  if (rawMetadata?.type !== "collection_view_page" && rawMetadata?.type !== "collection_view") {
    console.log(`pageId "${id}" is not a database`);
    return null;
  }

  const pageIds = getAllPageIds(collectionQuery);
  const data = [];
  for (let i = 0; i < pageIds.length; i++) {
    const pid = pageIds[i];
    if (!block[pid] || !block[pid].value) {
      console.log(`Skip invalid block: ${pid}`);
      continue;
    }
    const properties = (await getPageProperties(pid, block, schema)) || null;
    if (!properties) {
      console.log(`Skip post with no properties: ${pid}`);
      continue;
    }
    properties.fullWidth = block[pid].value?.format?.page_full_width ?? false;
    properties.date = (
      properties.date?.start_date
        ? dayjs.tz(properties.date?.start_date)
        : dayjs(block[pid].value?.created_time)
    ).valueOf();
    data.push(properties);
  }

  return data;
}

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */
export async function getAllPosts({ includePages = false }) {
  const now = Date.now();

  // Return cached result if still fresh
  if (_cachedPosts !== null && now - _cacheTimestamp < CACHE_TTL_MS) {
    const posts = filterPublishedPosts({ posts: _cachedPosts, includePages });
    if (BLOG.sortByDate) posts.sort((a, b) => b.date - a.date);
    return posts;
  }

  // Deduplicate concurrent fetches: reuse in-flight promise
  if (!_fetchPromise) {
    _fetchPromise = fetchAllPostsFromNotion().finally(() => {
      _fetchPromise = null;
    });
  }

  const data = await _fetchPromise;

  if (!data) return [];

  // Update cache
  _cachedPosts = data;
  _cacheTimestamp = Date.now();

  const posts = filterPublishedPosts({ posts: data, includePages });
  if (BLOG.sortByDate) posts.sort((a, b) => b.date - a.date);
  return posts;
}
