import { NotionAPI } from 'notion-client'

// Vercel/environment-variable copy-paste can introduce quotes or newlines.
// notion-client expects the raw token_v2 value and adds the cookie itself.
const notionAccessToken = process.env.NOTION_ACCESS_TOKEN
  ?.trim()
  .replace(/^['"]|['"]$/g, '')

const notionFetchOptions = {
  headers: {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
  }
}

export const publicApi = new NotionAPI({ ofetchOptions: notionFetchOptions })

const client = new NotionAPI({
  authToken: notionAccessToken || undefined,
  // Notion's Cloudflare layer currently rejects Node requests without a UA.
  ofetchOptions: notionFetchOptions
})

export default client
