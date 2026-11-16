import { createHmac, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { server as wisp, logging } from '@mercuryworkshop/wisp-js/server'
import { scramjetPath } from '@mercuryworkshop/scramjet/path'
import { libcurlPath } from '@mercuryworkshop/libcurl-transport'
import { baremuxPath } from '@mercuryworkshop/bare-mux/node'

const publicPath = fileURLToPath(new URL('../public/', import.meta.url))
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000
const MAX_AUTH_FAILURES = 12
const AUTH_WINDOW_MS = 15 * 60 * 1000

function requiredOrigin(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required.`)
  let url
  try { url = new URL(value) } catch { throw new Error(`${name} must be an absolute origin.`) }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an HTTPS origin without a path (HTTP is allowed only for localhost).`)
  }
  return url.origin
}

function requiredSecret(name, minimumLength) {
  const value = process.env[name]
  if (!value || value.length < minimumLength || value.startsWith('replace-')) {
    throw new Error(`${name} must be set to a random value of at least ${minimumLength} characters.`)
  }
  return value
}

const publicOrigin = requiredOrigin('PUBLIC_URL')
const lumenOrigin = requiredOrigin('LUMEN_ORIGIN')
const accessPassword = requiredSecret('PROXY_ACCESS_PASSWORD', 24)
const tokenSecret = requiredSecret('PROXY_TOKEN_SECRET', 32)
const port = Number(process.env.PORT || 8080)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.')

function equalSecret(candidate, expected) {
  if (typeof candidate !== 'string') return false
  const left = Buffer.from(candidate)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

function createAccessToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })).toString('base64url')
  const signature = createHmac('sha256', tokenSecret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function validAccessToken(token) {
  if (typeof token !== 'string') return false
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return false
  const expected = createHmac('sha256', tokenSecret).update(payload).digest()
  const actual = Buffer.from(signature, 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return Number.isSafeInteger(decoded.exp) && decoded.exp > Date.now() && decoded.exp <= Date.now() + TOKEN_TTL_MS + 5_000
  } catch { return false }
}

const authFailures = new Map()
function authRateLimited(ip) {
  const now = Date.now()
  const recent = authFailures.get(ip)
  if (!recent || recent.startedAt + AUTH_WINDOW_MS <= now) {
    authFailures.set(ip, { startedAt: now, count: 0 })
    return false
  }
  return recent.count >= MAX_AUTH_FAILURES
}
function recordAuthFailure(ip) {
  const item = authFailures.get(ip) ?? { startedAt: Date.now(), count: 0 }
  item.count += 1
  authFailures.set(ip, item)
  if (authFailures.size > 2_000) {
    const now = Date.now()
    for (const [key, value] of authFailures) if (value.startedAt + AUTH_WINDOW_MS <= now) authFailures.delete(key)
  }
}

logging.set_level(logging.NONE)
Object.assign(wisp.options, {
  allow_udp_streams: false,
  dns_servers: ['1.1.1.3', '1.0.0.3'],
  hostname_blacklist: [
    /^(?:localhost|.*\.localhost)$/i,
    /^(?:0|10|127)\./,
    /^192\.168\./,
    /^169\.254\./,
    /^172\.(?:1[6-9]|2\d|3[01])\./,
    /^100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
    /(^|\.)local$/i,
    /^metadata\.google\.internal$/i,
    /^(?:\[)?(?:::1|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:|fe80:)/i,
  ],
})

function rejectUpgrade(socket) {
  if (!socket.destroyed) socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n')
}

const fastify = Fastify({
  logger: { redact: ['req.url'] },
  trustProxy: process.env.TRUST_PROXY === '1',
  bodyLimit: 2_048,
  serverFactory: (handler) => createServer()
    .on('request', (request, reply) => {
      reply.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      reply.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      handler(request, reply)
    })
    .on('upgrade', (request, socket, head) => {
      let requestUrl
      try { requestUrl = new URL(request.url || '/', publicOrigin) } catch { return rejectUpgrade(socket) }
      const allowed = requestUrl.pathname === '/wisp/' && request.headers.origin === publicOrigin && validAccessToken(requestUrl.searchParams.get('token'))
      if (!allowed) return rejectUpgrade(socket)
      request.url = '/wisp/'
      wisp.routeRequest(request, socket, head)
    }),
})

fastify.addHook('onSend', async (_request, reply, payload) => {
  reply.header('Content-Security-Policy', `frame-ancestors 'self' ${lumenOrigin}`)
  return payload
})

fastify.get('/healthz', async (_request, reply) => reply.header('Cache-Control', 'no-store').send({ ok: true }))
fastify.post('/api/auth', async (request, reply) => {
  reply.header('Cache-Control', 'no-store')
  if (request.headers.origin !== publicOrigin) return reply.code(403).send({ error: 'Origin not allowed.' })
  const ip = request.ip || request.socket.remoteAddress || 'unknown'
  if (authRateLimited(ip)) return reply.code(429).send({ error: 'Too many attempts. Wait before trying again.' })
  const accessCode = request.body && typeof request.body === 'object' ? request.body.accessCode : undefined
  if (!equalSecret(accessCode, accessPassword)) {
    recordAuthFailure(ip)
    return reply.code(401).send({ error: 'Access code not accepted.' })
  }
  authFailures.delete(ip)
  return reply.send({ token: createAccessToken(), expiresAt: Date.now() + TOKEN_TTL_MS })
})

const staticOptions = { root: publicPath, decorateReply: true }
fastify.register(fastifyStatic, staticOptions)
fastify.register(fastifyStatic, { root: scramjetPath, prefix: '/scram/', decorateReply: false })
fastify.register(fastifyStatic, { root: libcurlPath, prefix: '/libcurl/', decorateReply: false })
fastify.register(fastifyStatic, { root: baremuxPath, prefix: '/baremux/', decorateReply: false })
fastify.setNotFoundHandler((_request, reply) => reply.code(404).type('text/html').sendFile('404.html'))

await fastify.listen({ port, host: '0.0.0.0' })
fastify.log.info({ port, publicOrigin, lumenOrigin }, 'LUMEN Scramjet service listening')

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await fastify.close()
    process.exit(0)
  })
}
