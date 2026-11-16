'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Globe2, Home, LockKeyhole, RotateCw, Search, ShieldCheck } from 'lucide-react'
import type { LumenSettings } from '@/components/lumen/settings-page'

type Props = {
  settings: LumenSettings
  initialQuery: string
  autoOpen?: boolean
  direct?: boolean
  immersive?: boolean
  title?: string
  description?: string
}

function normalizeAddress(value: string) {
  const input = value.trim()
  if (!input) return ''
  if (/^https?:\/\//i.test(input)) return input
  if (/^(localhost|(?:[a-z0-9-]+\.)+[a-z]{2,})(:\d+)?(?:\/.*)?$/i.test(input)) return `https://${input}`
  return `https://duckduckgo.com/?q=${encodeURIComponent(input)}`
}

export function makeProxyUrl(engine: LumenSettings['proxyEngine'], endpoint: string, destination: string) {
  try {
    const service = new URL(endpoint.trim())
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(service.hostname)
    if ((service.protocol !== 'https:' && !(local && service.protocol === 'http:')) || service.username || service.password || service.pathname !== '/' || service.search || service.hash) return ''
    if (engine === 'scramjet') return `${service.origin}/?url=${encodeURIComponent(destination)}`
    return `${service.origin}/service/${encodeURIComponent(destination)}`
  } catch {
    return ''
  }
}

export function EmbeddedBrowser({ settings, initialQuery, autoOpen = false, direct = false, immersive = false, title = 'Web search', description = 'Search and open websites inside LUMEN instead of launching a separate search tab.' }: Props) {
  const [address, setAddress] = useState(initialQuery)
  const [activeUrl, setActiveUrl] = useState('')
  const [frameKey, setFrameKey] = useState(0)
  const [frameError, setFrameError] = useState(false)
  const destination = useMemo(() => normalizeAddress(address), [address])
  const shouldProxy = !direct && settings.proxyEnabled && Boolean(settings.proxyEndpoint)
  const resolveFrameUrl = useCallback((value: string) => {
    const url = normalizeAddress(value)
    if (!url) return ''
    return !direct && settings.proxyEnabled && settings.proxyEndpoint ? makeProxyUrl(settings.proxyEngine, settings.proxyEndpoint, url) || url : url
  }, [direct, settings.proxyEnabled, settings.proxyEndpoint, settings.proxyEngine])
  const openAddress = useCallback((value: string) => {
    const url = resolveFrameUrl(value)
    if (!url) return
    setAddress(value)
    setFrameError(false)
    setActiveUrl(url)
    setFrameKey((key) => key + 1)
  }, [resolveFrameUrl])

  useEffect(() => {
    setAddress(initialQuery)
    if (!autoOpen || !initialQuery) return
    const timer = window.setTimeout(() => openAddress(initialQuery), 0)
    return () => window.clearTimeout(timer)
  }, [initialQuery, autoOpen, openAddress])

  const navigate = () => openAddress(address)
  const submit = (event: FormEvent) => { event.preventDefault(); navigate() }
  const engineName = settings.proxyEngine === 'ultraviolet' ? 'Ultraviolet' : 'Scramjet'
  const proxyNote = !direct && settings.proxyEnabled && !settings.proxyEndpoint

  if (immersive) {
    return <section className="lumen-cinecat-viewport" aria-label={title}>
      {activeUrl && !frameError
        ? <iframe key={frameKey} title={title} src={activeUrl} className="lumen-cinecat-frame" referrerPolicy="no-referrer" onError={() => setFrameError(true)} allow="cross-origin-isolated; fullscreen; autoplay; clipboard-read; clipboard-write; picture-in-picture" allowFullScreen />
        : <div className="lumen-cinecat-fallback" role={activeUrl ? 'alert' : 'status'}><strong>{activeUrl ? 'Cinecat could not be embedded.' : 'Loading Cinecat…'}</strong>{activeUrl && <p>Try again shortly, or return to LUMEN. The remote site controls what can be shown inside a frame.</p>}</div>}
    </section>
  }

  return <section className="lumen-browser-page" aria-label={title}>
    <header className="lumen-page-heading"><div><p className="lumen-eyebrow"><Globe2 /> IN-SITE BROWSER</p><h1>{title}</h1><p>{description}</p></div><span className="lumen-browser-engine"><ShieldCheck />{direct ? 'Direct' : shouldProxy ? engineName : 'Direct fallback'}</span></header>
    <section className="lumen-browser-shell" aria-label="In-site browser">
      <div className="lumen-browser-toolbar"><div className="lumen-browser-controls"><button disabled aria-label="Back"><ArrowLeft /></button><button disabled aria-label="Forward"><ArrowRight /></button><button type="button" onClick={() => { setFrameError(false); setFrameKey((key) => key + 1) }} disabled={!activeUrl} aria-label="Reload"><RotateCw /></button><button type="button" onClick={() => { setAddress(''); setActiveUrl(''); setFrameError(false) }} aria-label="New tab"><Home /></button></div><form onSubmit={submit} className="lumen-addressbar" role="search"><LockKeyhole /><label className="sr-only" htmlFor="lumen-address">Search or enter a URL</label><input id="lumen-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search the web or enter a URL" autoComplete="off"/><button type="submit" aria-label="Go"><Search /></button></form><button type="button" className="lumen-browser-go" onClick={navigate}>Go</button></div>
      <div className="lumen-browser-tab"><span className="lumen-tab-dot" />{activeUrl && destination ? new URL(destination).hostname : 'New tab'}<span className="lumen-tab-close">×</span></div>
      <div className="lumen-browser-viewport">{activeUrl && !frameError ? <iframe key={frameKey} title={`${title} in-site browser`} src={activeUrl} referrerPolicy="no-referrer" onError={() => setFrameError(true)} allow="cross-origin-isolated; fullscreen; autoplay; clipboard-read; clipboard-write" /> : <div className="lumen-browser-start"><div className="lumen-browser-mark">L</div><p className="lumen-eyebrow">{activeUrl ? 'PAGE COULD NOT LOAD' : 'LOADING DESTINATION'}</p><h2>{activeUrl ? 'This site did not open in the frame.' : title}</h2><p>{activeUrl ? 'Try Reload, or configure a compatible proxy service in Settings if this provider blocks direct frames.' : 'The destination will stay inside this LUMEN tab.'}</p></div>}</div>
      <div className="lumen-browser-status"><span><i />{activeUrl ? frameError ? 'Page unavailable' : 'Browsing in LUMEN' : 'Ready'}</span><span>{direct ? 'Direct in-site view' : shouldProxy ? `Connected via ${engineName}` : 'Direct loading'}</span></div>
    </section>
    {proxyNote && <aside className="lumen-proxy-notice" role="note"><ShieldCheck /><div><strong>Direct loading is active.</strong><p>Configure a compatible Ultraviolet or Scramjet service in Settings only if a provider blocks direct loading.</p></div></aside>}
  </section>
}
