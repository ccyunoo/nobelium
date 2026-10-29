// Keep retries bounded: a failure must reach Next.js rather than become empty content.
function isRetryable (error) {
  const status = error?.status ?? error?.statusCode ?? error?.response?.status
  return status == null || status === 429 || status >= 500
}

function retryAfterMs (error, now) {
  const value = error?.response?.headers?.get?.('retry-after')
  if (!value) return 0
  const seconds = Number(value)
  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - now()
  return Number.isFinite(ms) ? Math.max(0, Math.min(ms, 15000)) : 0
}

async function withNotionRetry (request, options = {}) {
  const sleep = options.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)))
  const random = options.random ?? Math.random
  const now = options.now ?? Date.now
  const attempts = 4
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await request()
    } catch (error) {
      if (!isRetryable(error) || attempt === attempts - 1) throw error
      const backoff = 1000 * (2 ** attempt) + Math.floor(random() * 500)
      await sleep(Math.max(backoff, retryAfterMs(error, now)))
    }
  }
}

module.exports = { withNotionRetry }
