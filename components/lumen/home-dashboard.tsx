'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Gamepad2, Grid2X2, MessageCircle, Search, Settings2, Tv, Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Game } from '@/lib/games'
import type { AppItem } from '@/lib/apps'
import type { WatchItem } from '@/lib/watch'

const shortcuts = [
  { label: 'games', href: '/games', icon: Gamepad2 },
  { label: 'apps', href: '/apps', icon: Grid2X2 },
  { label: 'watch', href: '/watch', icon: Tv },
  { label: 'chat', href: '/chat', icon: MessageCircle },
  { label: 'settings', href: '/settings', icon: Settings2 },
]

type HomeDashboardProps = {
  games: Game[]
  savedGames: string[]
  savedApps: string[]
  watchlist: string[]
  recentGames: Game[]
  recentWatch: WatchItem[]
  onPlay: (game: Game) => void
  onSaveGame: (game: Game) => void
  onSaveWatch: (item: WatchItem) => void
  onSaveApp: (item: AppItem) => void
  onSurprise: () => void
}

export function HomeDashboard(_props: HomeDashboardProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [cornerPanelOpen, setCornerPanelOpen] = useState(true)

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = query.trim()
    router.push(value ? `/explore?q=${encodeURIComponent(value)}` : '/explore')
  }

  return <div className="lumen-home" aria-label="LUMEN home launcher">
    <div className="lumen-online-badge" aria-label="Online users: 4">
      <span aria-hidden="true" className="lumen-online-dot" />
      <span>online users:</span>
      <strong>4</strong>
    </div>

    <section className="lumen-home-hero" aria-labelledby="lumen-home-title">
      <h1 id="lumen-home-title" className="lumen-wordmark">lumen</h1>
      <form className="lumen-home-search" onSubmit={submitSearch} role="search">
        <Search aria-hidden="true" className="size-3.5 shrink-0" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search or enter a URL" placeholder="search or enter a url" autoComplete="off" />
        <button type="submit" aria-label="Search LUMEN"><ArrowRight aria-hidden="true" className="size-3.5" /></button>
      </form>
      <nav className="lumen-home-shortcuts" aria-label="Quick launch">
        {shortcuts.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className="lumen-home-chip">
          <Icon aria-hidden="true" className="size-3" />
          <span>{label}</span>
        </Link>)}
      </nav>
    </section>

    {cornerPanelOpen && <aside className="lumen-home-corner-panel" aria-label="Quick panel">
      <button type="button" onClick={() => setCornerPanelOpen(false)} aria-label="Close quick panel">×</button>
    </aside>}

    <div className="lumen-home-socials" aria-label="LUMEN links">
      <Link href="/settings">credits</Link>
      <Link href="/chat"><MessageCircle aria-hidden="true" className="size-3" />discord</Link>
      <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer"><Wrench aria-hidden="true" className="size-3" />tiktok</a>
    </div>
  </div>
}
