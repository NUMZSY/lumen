'use strict'

const form = document.getElementById('sj-form')
const address = document.getElementById('sj-address')
const searchEngine = document.getElementById('sj-search-engine')
const error = document.getElementById('sj-error')
const errorCode = document.getElementById('sj-error-code')
const accessGate = document.getElementById('access-gate')
const homeCard = document.getElementById('home-card')
const accessForm = document.getElementById('access-form')
const accessCodeInput = document.getElementById('access-code')
const accessError = document.getElementById('access-error')
const initialDestination = new URLSearchParams(location.search).get('url') || ''
if (initialDestination) history.replaceState(null, document.title, location.pathname)
const tokenKey = 'lumen.scramjet.token'
const expiryKey = 'lumen.scramjet.expiry'
let pendingDestination = ''
let launchInProgress = false

const { ScramjetController } = $scramjetLoadController()
const scramjet = new ScramjetController({
  files: {
    wasm: '/scram/scramjet.wasm.wasm',
    all: '/scram/scramjet.all.js',
    sync: '/scram/scramjet.sync.js',
  },
})
scramjet.init()
const connection = new BareMux.BareMuxConnection('/baremux/worker.js')

function setError(message, detail = '') {
  error.textContent = message
  errorCode.textContent = detail
}

function checkedUrl(value, allowSearch = false) {
  const candidate = allowSearch ? search(value, searchEngine.value) : value
  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return ''
    return url.href
  } catch {
    return ''
  }
}

function cachedToken() {
  const token = sessionStorage.getItem(tokenKey)
  const expiresAt = Number(sessionStorage.getItem(expiryKey))
  if (token && Number.isFinite(expiresAt) && expiresAt > Date.now() + 15_000) return token
  sessionStorage.removeItem(tokenKey)
  sessionStorage.removeItem(expiryKey)
  return ''
}

function showAccessGate(destination, message = '') {
  pendingDestination = destination
  form.hidden = true
  homeCard.hidden = true
  accessGate.hidden = false
  accessError.textContent = message
  accessError.hidden = !message
  accessCodeInput.focus()
}

function showHome() {
  accessGate.hidden = true
  homeCard.hidden = false
  form.hidden = false
  accessError.hidden = true
}

async function authenticate(accessCode) {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ accessCode }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || typeof result.token !== 'string' || !Number.isFinite(result.expiresAt)) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Could not authorize this session.')
  }
  sessionStorage.setItem(tokenKey, result.token)
  sessionStorage.setItem(expiryKey, String(result.expiresAt))
  return result.token
}

async function launch(value, token) {
  const destination = checkedUrl(value)
  if (!destination) {
    showHome()
    setError('Enter a valid http:// or https:// address or search query.')
    return
  }
  if (launchInProgress) return
  launchInProgress = true
  setError('', '')
  try {
    await registerSW()
    const wispProtocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const wispUrl = `${wispProtocol}://${location.host}/wisp/?token=${encodeURIComponent(token)}`
    await connection.setTransport('/libcurl/index.mjs', [{ websocket: wispUrl }])
    document.getElementById('sj-frame')?.remove()
    const frame = scramjet.createFrame()
    frame.frame.id = 'sj-frame'
    frame.frame.title = 'Scramjet web page'
    document.body.appendChild(frame.frame)
    document.body.classList.add('is-proxying')
    frame.go(destination)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause)
    setError('Could not start the proxy session.', message)
    showHome()
  } finally {
    launchInProgress = false
  }
}

async function openDestination(value) {
  const destination = checkedUrl(value, true)
  if (!destination) {
    setError('Enter a valid http:// or https:// address or search query.')
    return
  }
  const token = cachedToken()
  if (!token) {
    showAccessGate(destination)
    return
  }
  await launch(destination, token)
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  await openDestination(address.value)
})

accessForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const accessCode = accessCodeInput.value
  accessError.hidden = false
  accessError.textContent = 'Checking access…'
  try {
    const token = await authenticate(accessCode)
    accessCodeInput.value = ''
    accessError.hidden = true
    accessGate.hidden = true
    if (pendingDestination) await launch(pendingDestination, token)
    else showHome()
  } catch (cause) {
    accessError.textContent = cause instanceof Error ? cause.message : 'Access was not accepted.'
  }
})

if (initialDestination) {
  address.value = initialDestination
  void openDestination(initialDestination)
}
