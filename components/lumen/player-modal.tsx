'use client'

import { useEffect, useMemo, useState } from 'react'
import { Expand, ExternalLink, Flag, RotateCcw, X } from 'lucide-react'
import { sourceTypeLabel, type Game } from '@/lib/games'
import type { LumenSettings } from '@/components/lumen/settings-page'
import { makeProxyUrl } from '@/components/lumen/embedded-browser'

function getDirectGameUrl(game: Game) {
  if (game.playUrl.startsWith('/') && !game.playUrl.startsWith('//')) return game.playUrl
  try {
    const url = new URL(game.playUrl)
    if (url.protocol !== 'https:' || url.username || url.password) return null

    if (game.provider === 'GN-Math' && url.hostname === 'cdn.jsdelivr.net') {
      const match = url.pathname.match(/^\/gh\/freebuisness\/html@main\/(.+\.html)$/i)
      if (match) return `https://raw.githack.com/freebuisness/html/main/${match[1]}`
    }

    if (game.provider === 'Seraph') {
      const legacy = url.pathname.match(/^\/games\/([^/]+)\/?$/i)
      if (url.hostname === 'seraph.reveriestudios.online' && legacy) {
        return `https://raw.githack.com/a456pur/seraph/main/games/${encodeURIComponent(legacy[1])}/index.html`
      }
      const cdn = url.pathname.match(/^\/gh\/a456pur\/seraph@main\/(games\/[^?#]+\/index\.html)$/i)
      if (url.hostname === 'cdn.jsdelivr.net' && cdn) {
        return `https://raw.githack.com/a456pur/seraph/main/${cdn[1]}`
      }
    }

    return url.href
  } catch {
    return null
  }
}

function safeDestination(game: Game, settings: LumenSettings) {
  const directUrl = getDirectGameUrl(game)
  if (!directUrl) return null
  if (!directUrl.startsWith('https://')) return directUrl
  return makeProxyUrl(settings.proxyEngine, settings.proxyEndpoint, directUrl) || directUrl
}

function directLink(game: Game) {
  return getDirectGameUrl(game) || undefined
}

export function PlayerModal({ game, settings, onClose, onReport }: { game: Game; settings: LumenSettings; onClose: () => void; onReport: (game: Game) => void }) {
  const [retry, setRetry] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [frameError, setFrameError] = useState(false)
  const source = useMemo(() => safeDestination(game, settings), [game, settings])
  const providerUrl = useMemo(() => directLink(game), [game])
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKeyDown) }
  }, [onClose])
  const player = typeof document === 'undefined' ? null : document.getElementById(`lumen-game-player-${game.slug}`)
  const toggleFullscreen = async () => {
    if (!player) return
    if (document.fullscreenElement) await document.exitFullscreen()
    else await player.requestFullscreen()
    setFullscreen(Boolean(document.fullscreenElement))
  }
  const external = Boolean(source?.startsWith('https://'))

  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-black/85 p-2 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="lumen-player-title" className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-[#10121b] shadow-2xl">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-3 sm:px-4">
        <div className="min-w-0"><h2 id="lumen-player-title" className="truncate text-sm font-medium">{game.title}</h2><p className="mt-0.5 truncate text-[10px] text-white/45">{game.provider} · {sourceTypeLabel(game.sourceType)}</p></div>
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => onReport(game)} className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10" aria-label="Report game"><Flag className="size-4" /></button>
          <button onClick={toggleFullscreen} className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}><Expand className="size-4" /></button>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10" aria-label="Close game player"><X className="size-4" /></button>
        </div>
      </header>
      <div id={`lumen-game-player-${game.slug}`} className="relative min-h-[min(70vh,620px)] bg-[#090a10]">
        {source && !frameError && <iframe key={`${game.slug}-${retry}`} title={`${game.title} player`} src={source} className="absolute inset-0 size-full border-0" allow="autoplay; fullscreen; gamepad; picture-in-picture; pointer-lock; clipboard-read; clipboard-write" allowFullScreen referrerPolicy="no-referrer" sandbox={external ? 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-modals' : undefined} onError={() => setFrameError(true)} />}
        {(frameError || !source) && <div className="absolute inset-0 grid place-items-center px-6 text-center"><div className="max-w-md"><h3 className="text-lg font-semibold">Game could not load in the frame</h3><p className="mt-2 text-sm leading-6 text-white/55">The game is still available from its listed provider. Some sites prevent embedding in other pages; try opening the provider directly.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><button onClick={() => { setFrameError(false); setRetry((value) => value + 1) }} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-[#11121a]"><RotateCcw className="size-3.5" />Try again</button>{providerUrl && <a href={providerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-xs text-white/75"><ExternalLink className="size-3.5" />Open provider</a>}</div></div></div>}
      </div>
      <footer className="flex min-h-10 items-center justify-between gap-3 border-t border-white/10 px-3 text-[10px] text-white/40 sm:px-4"><span className="truncate">{settings.proxyEndpoint ? `In-site player · ${settings.proxyEngine === 'ultraviolet' ? 'Ultraviolet' : 'Scramjet'}` : 'In-site player · direct provider fallback'}</span><span>Esc to close</span></footer>
    </section>
  </div>
}

export { PlayerModal as LumenPlayerModal }
