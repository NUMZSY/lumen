'use client'

import Link from 'next/link'
import { Bookmark, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { Game } from '@/lib/games'

type GamesCatalogPageProps = {
  games: Game[]
  savedGames: string[]
  onSave: (game: Game) => void
  onPlay: (game: Game) => void
  returnTo: string
  query: string
  onQuery: (value: string) => void
  category: string
  categories: string[]
  onCategory: (value: string) => void
  sort: string
  onSort: (value: string) => void
}

function DenseGameTile({ game, saved, onSave, onPlay, returnTo }: { game: Game; saved: boolean; onSave: () => void; onPlay: () => void; returnTo: string }) {
  const [imageError, setImageError] = useState(false)
  const detailHref = `/games/${game.slug}?${new URLSearchParams({ returnTo }).toString()}`

  return <article className="lumen-dense-game group">
    <button type="button" onClick={onPlay} className="lumen-dense-game-art" aria-label={`Play ${game.title}`}>
      {!imageError ? <img src={game.thumbnailUrl} alt="" onError={() => setImageError(true)} /> : <span className="lumen-dense-game-fallback" style={{ background: `linear-gradient(135deg, ${game.accent}, ${game.secondaryAccent})` }}>{game.symbol}</span>}
      <span className="lumen-dense-game-shade" />
    </button>
    <Link href={detailHref} className="lumen-dense-game-title">{game.title}</Link>
    <button type="button" onClick={onSave} aria-label={saved ? `Remove ${game.title} from library` : `Save ${game.title} to library`} aria-pressed={saved} className={`lumen-dense-game-save ${saved ? 'is-saved' : ''}`}><Bookmark aria-hidden="true" /></button>
  </article>
}

export function GamesCatalogPage({ games, savedGames, onSave, onPlay, returnTo, query, onQuery, category, categories, onCategory, sort, onSort }: GamesCatalogPageProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => event.preventDefault()

  return <div className="lumen-games-page">
    <header className="lumen-games-header">
      <Link href="/" className="lumen-games-wordmark">lumen</Link>
      <span className="lumen-games-greeting">hey</span>
      <nav className="lumen-games-tabs" aria-label="Catalog sections">
        <Link href="/games" aria-current="page">study</Link>
        <Link href="/apps">apps</Link>
        <Link href="/library">cloud</Link>
      </nav>
      <form className="lumen-games-search" onSubmit={submit} role="search">
        <Search aria-hidden="true" />
        <input value={query} onChange={(event) => onQuery(event.target.value)} aria-label="Search games" placeholder="search" />
        <select value={sort} onChange={(event) => onSort(event.target.value)} aria-label="Sort games"><option>Featured</option><option>A–Z</option><option>Recently added</option></select>
      </form>
    </header>

    <div className="lumen-games-meta">
      <span>{games.length} available</span>
      <div className="lumen-games-filters" aria-label="Filter games">
        {categories.slice(0, 5).map((item) => <button key={item} type="button" onClick={() => onCategory(item)} aria-pressed={category === item} className={category === item ? 'is-active' : ''}>{item.toLocaleLowerCase()}</button>)}
      </div>
    </div>

    <section className="lumen-dense-games-grid" aria-label="Games catalog">
      {games.map((game) => <DenseGameTile key={game.slug} game={game} saved={savedGames.includes(game.slug)} onSave={() => onSave(game)} onPlay={() => onPlay(game)} returnTo={returnTo} />)}
    </section>
  </div>
}
