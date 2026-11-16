'use client'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Globe2, Home, LockKeyhole, RotateCw, Search, ShieldCheck } from 'lucide-react'
import type { LumenSettings } from '@/components/lumen/settings-page'

type Props = { settings: LumenSettings; initialQuery: string; autoOpen?: boolean; title?: string; description?: string }
function normalizeAddress(value: string) {
  const input = value.trim()
  if (!input) return ''
  if (/^https?:\/\//i.test(input)) return input
  if (/^(localhost|(?:[a-z0-9-]+\.)+[a-z]{2,})(:\d+)?(?:\/.*)?$/i.test(input)) return `https://${input}`
  return `https://duckduckgo.com/?q=${encodeURIComponent(input)}`
}
export function makeProxyUrl(engine: LumenSettings['proxyEngine'], endpoint: string, destination: string) {
  const base = endpoint.trim().replace(/\/+$/, '')
  if (!base) return ''
  const path = engine === 'ultraviolet' ? '/service/' : '/scramjet/'
  return `${base}${path}${encodeURIComponent(destination)}`
}
export function EmbeddedBrowser({ settings, initialQuery, autoOpen = false, title = 'Web search', description = 'Search and open websites inside LUMEN instead of launching a separate search tab.' }: Props) {
  const [address, setAddress] = useState(initialQuery)
  const [activeUrl, setActiveUrl] = useState('')
  const [frameKey, setFrameKey] = useState(0)
  const [frameError, setFrameError] = useState(false)
  const destination = useMemo(() => normalizeAddress(address), [address])
  const proxiedUrl = useMemo(() => destination ? makeProxyUrl(settings.proxyEngine, settings.proxyEndpoint, destination) : '', [destination, settings.proxyEngine, settings.proxyEndpoint])
  const navigate = () => { if (!destination) return; setFrameError(!proxiedUrl); setActiveUrl(proxiedUrl || 'proxy-not-configured'); setFrameKey((key) => key + 1) }
  useEffect(() => { setAddress(initialQuery); if (autoOpen && initialQuery) window.setTimeout(navigate, 0) }, [initialQuery, autoOpen])
  const submit = (event: FormEvent) => { event.preventDefault(); navigate() }
  const engineName = settings.proxyEngine === 'ultraviolet' ? 'Ultraviolet' : 'Scramjet'
  return <section className="lumen-browser-page" aria-label={title}>
    <header className="lumen-page-heading"><div><p className="lumen-eyebrow"><Globe2 /> IN-SITE BROWSER</p><h1>{title}</h1><p>{description}</p></div><span className="lumen-browser-engine"><ShieldCheck />{engineName}</span></header>
    <section className="lumen-browser-shell" aria-label="In-site browser"><div className="lumen-browser-toolbar"><div className="lumen-browser-controls"><button disabled aria-label="Back"><ArrowLeft /></button><button disabled aria-label="Forward"><ArrowRight /></button><button type="button" onClick={() => { setFrameError(false); setFrameKey((key) => key + 1) }} disabled={!activeUrl} aria-label="Reload"><RotateCw /></button><button type="button" onClick={() => { setAddress(''); setActiveUrl(''); setFrameError(false) }} aria-label="New tab"><Home /></button></div><form onSubmit={submit} className="lumen-addressbar" role="search"><LockKeyhole /><label className="sr-only" htmlFor="lumen-address">Search or enter a URL</label><input id="lumen-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search the web or enter a URL" autoComplete="off"/><button type="submit" aria-label="Go"><Search /></button></form><button type="button" className="lumen-browser-go" onClick={navigate}>Go</button></div><div className="lumen-browser-tab"><span className="lumen-tab-dot" />{activeUrl && destination ? new URL(destination).hostname : 'New tab'}<span className="lumen-tab-close">×</span></div><div className="lumen-browser-viewport">{activeUrl && !frameError ? <iframe key={frameKey} title="LUMEN in-site browser" src={activeUrl} referrerPolicy="no-referrer" onError={() => setFrameError(true)} allow="fullscreen; autoplay; clipboard-read; clipboard-write" /> : <div className="lumen-browser-start"><div className="lumen-browser-mark">L</div><p className="lumen-eyebrow">{activeUrl ? 'PAGE COULD NOT LOAD' : 'A LITTLE MORE ROOM TO EXPLORE'}</p><h2>{activeUrl ? 'This site did not open in the frame.' : 'Where to next?'}</h2><p>{activeUrl ? 'Check your selected proxy engine and endpoint in Settings.' : 'Type a search or website in the address bar above. Your browsing stays in this tab.'}</p></div>}</div><div className="lumen-browser-status"><span><i />{activeUrl ? frameError ? 'Page unavailable' : 'Browsing in LUMEN' : 'Ready'}</span><span>{settings.proxyEndpoint ? `Connected via ${engineName}` : `${engineName} proxy endpoint not set`}</span></div></section>
    {!settings.proxyEndpoint && <aside className="lumen-proxy-notice" role="note"><ShieldCheck /><div><strong>Connect your proxy service to start browsing.</strong><p>{engineName} runs through a separate service. Add its base URL in <a href="/settings">Settings → Web proxy</a>.</p></div></aside>}
  </section>
}
