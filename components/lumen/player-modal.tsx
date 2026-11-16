'use client'

import { useEffect, useMemo, useState } from 'react'
import { Expand, Flag, RotateCcw, X } from 'lucide-react'
import { sourceTypeLabel, type Game } from '@/lib/games'
import type { LumenSettings } from '@/components/lumen/settings-page'
import { makeProxyUrl } from '@/components/lumen/embedded-browser'

function safeDestination(game: Game, settings: LumenSettings) {
  if (game.playUrl.startsWith('/') && !game.playUrl.startsWith('//')) return game.playUrl
  try {
    const destination = new URL(game.playUrl)
    if (destination.protocol !== 'https:') return null
    return makeProxyUrl(settings.proxyEngine, settings.proxyEndpoint, destination.href) || null
  } catch { return null }
}

export function PlayerModal({ game, settings, onClose, onReport }: { game: Game; settings: LumenSettings; onClose: () => void; onReport: (game: Game) => void }) {
  const [retry, setRetry] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [frameError, setFrameError] = useState(false)
  const source = useMemo(() => safeDestination(game, settings), [game, settings])
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = '' } }, [])
  const isExternal = /^https?:\/\//i.test(game.playUrl)
  const needsProxy = isExternal && !settings.proxyEndpoint
  const player = document.getElementById(`lumen-game-player-${game.slug}`)
  const toggleFullscreen = async () => { if (!player) return; if (document.fullscreenElement) await document.exitFullscreen(); else await player.requestFullscreen(); setFullscreen(Boolean(document.fullscreenElement)) }

  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-black/85 p-2 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="lumen-player-title" className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-[#10121b] shadow-2xl">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-3 sm:px-4"><div className="min-w-0"><h2 id="lumen-player-title" className="truncate text-sm font-medium">{game.title}</h2><p className="mt-0.5 truncate text-[10px] text-white/45">{game.provider} · {sourceTypeLabel(game.sourceType)}</p></div><div className="flex shrink-0 items-center gap-1"><button onClick={() => onReport(game)} className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10" aria-label="Report game"><Flag className="size-4" /></button><button onClick={toggleFullscreen} className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}><Expand className="size-4" /></button><button onClick={onClose} className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10" aria-label="Close game player"><X className="size-4" /></button></div></header>
      <div id={`lumen-game-player-${game.slug}`} className="relative min-h-[min(70vh,620px)] bg-[#090a10]">
        {source && !frameError && <iframe key={`${game.slug}-${retry}`} title={`${game.title} player`} src={source} className="absolute inset-0 size-full border-0" allow="autoplay; fullscreen; gamepad; picture-in-picture" allowFullScreen referrerPolicy="no-referrer" onError={() => setFrameError(true)} />}
        {(needsProxy || frameError || !source) && <div className="absolute inset-0 grid place-items-center px-6 text-center"><div className="max-w-md"><h3 className="text-lg font-semibold">{needsProxy ? 'Connect the in-site proxy' : 'Game could not load in the frame'}</h3><p className="mt-2 text-sm leading-6 text-white/55">{needsProxy ? 'This provider blocks direct embedding. Choose Ultraviolet or Scramjet and add its service endpoint in Settings → Web proxy, then play again.' : 'The provider or proxy did not return a playable page. Try again after checking the selected proxy endpoint.'}</p><div className="mt-5 flex justify-center gap-2"><button onClick={() => { setFrameError(false); setRetry((value) => value + 1) }} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-[#11121a]"><RotateCcw className="size-3.5" />Try again</button><button onClick={() => { onClose(); window.history.pushState({}, '', '/settings'); window.dispatchEvent(new PopStateEvent('popstate')) }} className="min-h-10 rounded-lg border border-white/15 px-4 text-xs text-white/75">Open Settings</button></div></div></div>}
      </div>
      <footer className="flex min-h-10 items-center justify-between gap-3 border-t border-white/10 px-3 text-[10px] text-white/40 sm:px-4"><span className="truncate">In-site player · {settings.proxyEngine === 'ultraviolet' ? 'Ultraviolet' : 'Scramjet'}</span><span>Esc to close</span></footer>
    </section>
  </div>
}

export { PlayerModal as LumenPlayerModal }
