import { NotionAPI } from 'notion-client'

const { NOTION_ACCESS_TOKEN } = process.env

const authToken =
  NOTION_ACCESS_TOKEN && !/^https?:\/\//i.test(NOTION_ACCESS_TOKEN)
    ? NOTION_ACCESS_TOKEN
    : undefined

if (NOTION_ACCESS_TOKEN && !authToken) {
  console.error('Invalid NOTION_ACCESS_TOKEN, ignoring it')
}

const client = new NotionAPI(authToken ? { authToken } : {})

export default client
