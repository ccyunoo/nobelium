export default async function handler(req, res) {
  const { secret, slug } = req.query

  // Optional: Compare secret with NOTION_ACCESS_TOKEN or process.env.REVALIDATE_SECRET
  // If REVALIDATE_SECRET is defined in env, enforce match
  if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  if (!slug) {
    return res.status(400).json({ message: 'Missing slug parameter' })
  }

  try {
    const targetPath = slug.startsWith('/') ? slug : `/${slug}`
    await res.revalidate(targetPath)
    return res.json({ revalidated: true, path: targetPath })
  } catch (err) {
    console.error('Revalidation error:', err)
    return res.status(500).json({ message: 'Error revalidating', error: String(err) })
  }
}
