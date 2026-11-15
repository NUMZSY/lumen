'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Cloud, Grid2X2, Music2, Search, Settings2 } from 'lucide-react'
import type { Game } from '@/lib/games'
import type { AppItem } from '@/lib/apps'
import type { WatchItem } from '@/lib/watch'

const shortcuts = [
  { label: 'study', href: '/games', icon: BookOpen },
  { label: 'apps', href: '/apps', icon: Grid2X2 },
  { label: 'music', href: '/watch', icon: Music2 },
  { label: 'cloud', href: '/library', icon: Cloud },
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
  const [query, setQuery] = useState('')

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    const isUrl = /^https?:\/\//i.test(value)
    const isDomain = /^(?:localhost|(?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(?:\/.*)?$/i.test(value)
    const destination = isUrl ? value : isDomain ? `https://${value}` : `https://duckduckgo.com/?q=${encodeURIComponent(value)}`
    window.location.assign(destination)
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
        <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search the web or enter a URL" placeholder="search the web or enter a url" autoComplete="off" />
        <button type="submit" aria-label="Search the web"><ArrowRight aria-hidden="true" className="size-3.5" /></button>
      </form>
      <nav className="lumen-home-shortcuts" aria-label="Quick launch">
        {shortcuts.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className="lumen-home-chip">
          <Icon aria-hidden="true" className="size-3" />
          <span>{label}</span>
        </Link>)}
      </nav>
    </section>

  </div>
}
