const test = require('node:test')
const assert = require('node:assert/strict')
const { withNotionRetry } = require('../lib/notion/retry.cjs')
const { getPostPageData } = require('../lib/notion/postPageData.cjs')

const options = delays => ({ sleep: async ms => delays.push(ms), random: () => 0, now: () => 0 })

test('429 honours Retry-After, then succeeds', async () => {
  let calls = 0; const delays = []
  const value = await withNotionRetry(async () => {
    if (++calls === 1) throw { status: 429, response: { headers: new Headers({ 'retry-after': '3' }) } }
    return 'ok'
  }, options(delays))
  assert.equal(value, 'ok'); assert.equal(calls, 2); assert.deepEqual(delays, [3000])
})

test('network and server errors retry with bounded exponential backoff', async () => {
  let calls = 0; const delays = []
  const value = await withNotionRetry(async () => {
    calls++
    if (calls === 1) throw new Error('network')
    if (calls === 2) throw { status: 503 }
    return 'ok'
  }, options(delays))
  assert.equal(value, 'ok'); assert.deepEqual(delays, [1000, 2000])
})

test('exhausted retries throw, and Retry-After is capped', async () => {
  let calls = 0; const delays = []; const error = { status: 429, response: { headers: new Headers({ 'retry-after': '999' }) } }
  await assert.rejects(withNotionRetry(async () => { calls++; throw error }, options(delays)), e => e === error)
  assert.equal(calls, 4); assert.deepEqual(delays, [15000, 15000, 15000])
})

test('403 or 404 are not retried', async () => {
  for (const status of [403, 404]) {
    let calls = 0; const delays = []
    await assert.rejects(withNotionRetry(async () => { calls++; throw { status } }, options(delays)))
    assert.equal(calls, 1); assert.deepEqual(delays, [])
  }
})

test('missing slug gives not found only after a successful list read', async () => {
  assert.equal(await getPostPageData('missing', async () => [], async () => { throw Error('unexpected') }), null)
  await assert.rejects(getPostPageData('missing', async () => { throw Error('list failed') }, async () => ({})), /list failed/)
})

test('temporary or incomplete body failures propagate instead of becoming 404', async () => {
  const list = async () => [{ id: 'page', slug: 'found' }]
  await assert.rejects(getPostPageData('found', list, async () => { throw Error('body failed') }), /body failed/)
  await assert.rejects(getPostPageData('found', list, async () => ({ block: {} })), /incomplete blocks/)
  const data = await getPostPageData('found', list, async () => ({ block: { page: {} } }))
  assert.equal(data.post.slug, 'found')
})
