import { NotionAPI } from 'notion-client'

// Vercel/environment-variable copy-paste can introduce quotes or newlines.
// notion-client expects the raw token_v2 value and adds the cookie itself.
const notionAccessToken = process.env.NOTION_ACCESS_TOKEN
  ?.trim()
  .replace(/^['"]|['"]$/g, '')

const client = new NotionAPI({
  authToken: notionAccessToken || undefined
})

export default client
