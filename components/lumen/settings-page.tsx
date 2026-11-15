'use client'
import { AlertTriangle, Globe2, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type LumenSettings = {
  theme: 'dark' | 'dim'
  reducedMotion: boolean
  autoplay: boolean
  sound: boolean
  chatMuted: boolean
  proxyEngine: 'ultraviolet' | 'scramjet'
  proxyEndpoint: string
}
const defaults: LumenSettings = { theme: 'dark', reducedMotion: false, autoplay: false, sound: false, chatMuted: false, proxyEngine: 'ultraviolet', proxyEndpoint: '' }
const options: { key: keyof Pick<LumenSettings, 'reducedMotion' | 'autoplay' | 'sound' | 'chatMuted'>; title: string; description: string }[] = [
  { key: 'reducedMotion', title: 'Reduce motion', description: 'Limit animated transitions and movement.' },
  { key: 'autoplay', title: 'Autoplay videos', description: 'Allow supported video content to start automatically.' },
  { key: 'sound', title: 'Sound effects', description: 'Enable interface sounds when available.' },
  { key: 'chatMuted', title: 'Mute chat by default', description: 'Keep chat previews quiet when you enter the site.' },
]
export function SettingsPage({ settings, onChange, onClear }: { settings: LumenSettings; onChange: (next: LumenSettings) => void; onClear: () => void }) {
  const current = { ...defaults, ...settings }
  return <section className="lumen-settings-page"><header className="lumen-page-heading"><div><p className="lumen-eyebrow"><SlidersHorizontal /> YOUR PREFERENCES</p><h1>Settings</h1><p>Make LUMEN feel like yours on this device.</p></div></header><div className="lumen-settings-grid">
    <section className="lumen-settings-card"><div className="lumen-settings-card-title"><span><SlidersHorizontal /></span><div><h2>Experience</h2><p>Appearance, motion and playback</p></div></div><label className="lumen-field-label" htmlFor="theme-choice">Theme preference</label><select id="theme-choice" value={current.theme} onChange={(event) => onChange({ ...current, theme: event.target.value as 'dark' | 'dim' })} className="lumen-select"><option value="dark">Dark — near black</option><option value="dim">Dim — softer charcoal</option></select><div className="lumen-settings-toggles">{options.map((option) => <label key={option.key} className="lumen-toggle-row"><span><strong>{option.title}</strong><small>{option.description}</small></span><input type="checkbox" checked={current[option.key]} onChange={(event) => onChange({ ...current, [option.key]: event.target.checked })} aria-label={option.title} /></label>)}</div></section>
    <section id="web-proxy" className="lumen-settings-card"><div className="lumen-settings-card-title"><span><Globe2 /></span><div><h2>Web proxy</h2><p>Choose the engine used for in-site browsing</p></div></div><label className="lumen-field-label" htmlFor="proxy-engine">Proxy engine</label><select id="proxy-engine" value={current.proxyEngine} onChange={(event) => onChange({ ...current, proxyEngine: event.target.value as LumenSettings['proxyEngine'] })} className="lumen-select"><option value="ultraviolet">Ultraviolet</option><option value="scramjet">Scramjet</option></select><p className="lumen-field-help">Your selection is saved in this browser and applies to Web search.</p><label className="lumen-field-label" htmlFor="proxy-endpoint">Proxy service base URL</label><input id="proxy-endpoint" value={current.proxyEndpoint} onChange={(event) => onChange({ ...current, proxyEndpoint: event.target.value })} placeholder="https://your-proxy.example" inputMode="url" autoCapitalize="none" autoComplete="url" className="lumen-text-input"/><p className="lumen-field-help">A separately hosted {current.proxyEngine === 'ultraviolet' ? 'Ultraviolet' : 'Scramjet'} service is required. This app repository does not currently include or deploy that server. Use only a proxy you trust.</p><div className={`lumen-proxy-state${current.proxyEndpoint ? ' is-configured' : ''}`}><span />{current.proxyEndpoint ? 'Endpoint saved locally' : 'No proxy endpoint configured'}</div></section>
    <section className="lumen-settings-card lumen-privacy-card"><div className="lumen-settings-card-title"><span><ShieldCheck /></span><div><h2>About & privacy</h2><p>Prototype data and content sources</p></div></div><div className="lumen-settings-copy"><p>LUMEN is an entertainment hub prototype. Saved games, app data, watch progress, and local demo chat messages stay in your browser and are not synced to an account.</p><p>Watch samples are Creative Commons works from the Blender Foundation. Game links are provided by their listed hosts; LUMEN does not host game files.</p><p>Web proxy traffic is handled by the proxy endpoint you configure, not by LUMEN. Consider the operator’s privacy policy before entering personal data.</p></div></section>
    <section className="lumen-settings-card lumen-clear-card"><div className="lumen-settings-card-title"><span><AlertTriangle /></span><div><h2>Clear local data</h2><p>Remove saved preferences and activity from this browser</p></div></div><p>Clears favorites, histories, notes, tasks, chat, and settings from this device.</p><Button variant="destructive" size="sm" onClick={onClear} className="mt-4 min-h-10 px-4 text-xs">Clear all local data</Button></section>
  </div></section>
}
