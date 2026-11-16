'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, Bookmark, Gamepad2, LoaderCircle, Search } from 'lucide-react'
import type { Game } from '@/lib/games'
import seraphCatalog from '@/lib/seraph-games.json'

type SourceId = 'gn-math' | 'luminsdk' | 'seraph' | 'lumen'
type Entry = {
  id: string
  title: string
  thumbnailUrl: string
  source: SourceId
  category?: string
  description?: string
  playUrl?: string
  localGame?: Game
  sdkId?: string
  sdkImageToken?: string
}
type Props = {
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
type LuminGame = { id: string | number; name?: string; title?: string; image_token?: string; category?: string; description?: string }
type LuminResponse = { games?: unknown; results?: unknown; total?: number; pages?: number }
type LuminApi = {
  init: (options: { headless: true }) => Promise<unknown>
  getGames: (options: { page: number; limit: number; q?: string }) => Promise<unknown>
  getImageUrl: (token: string) => Promise<string>
  destroy?: () => void
  getGameUrl: (id: string) => Promise<string | { url?: string }>
}
declare global { interface Window { Lumin?: LuminApi } }

const GN_MATH_CATALOG = 'https://cdn.jsdelivr.net/gh/freebuisness/assets@main/zones.json'
const GN_MATH_COVERS = 'https://cdn.jsdelivr.net/gh/freebuisness/covers@main/'
const SERAPH_CATALOG = seraphCatalog as { id: string; title: string; thumbnailUrl: string; playUrl: string; sourceUrl: string }[]
const PAGE_SIZE = 48
const sourceTabs: { id: SourceId; label: string; href: string }[] = [
  { id: 'gn-math', label: 'gn-math', href: 'https://gn-math.dev/games.html' },
  { id: 'luminsdk', label: 'luminsdk', href: 'https://luminsdk.com' },
  { id: 'seraph', label: 'seraph', href: 'https://github.com/a456pur/seraph' },
  { id: 'lumen', label: 'LUMEN', href: '' },
]
let luminSdkReady: Promise<LuminApi> | null = null

function getLuminApi(): Promise<LuminApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('LuminSDK is only available in a browser.'))
  if (!luminSdkReady) {
    luminSdkReady = new Promise<LuminApi>((resolve, reject) => {
      if (window.Lumin) { resolve(window.Lumin); return }
      const script = document.createElement('script')
      script.id = 'lumen-luminsdk'
      script.src = 'https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js'
      script.async = true
      script.onload = () => window.Lumin ? resolve(window.Lumin) : reject(new Error('LuminSDK loaded without its catalog API.'))
      script.onerror = () => reject(new Error('Could not load the LuminSDK catalog script.'))
      document.head.appendChild(script)
    }).then(async (api) => { await api.init({ headless: true }); return api }).catch((error) => { luminSdkReady = null; throw error })
  }
  return luminSdkReady
}

function gamesFromResponse(result: unknown): LuminGame[] {
  if (Array.isArray(result)) return result as LuminGame[]
  if (result && typeof result === 'object') {
    const response = result as LuminResponse
    if (Array.isArray(response.games)) return response.games as LuminGame[]
    if (Array.isArray(response.results)) return response.results as LuminGame[]
  }
  return []
}

async function withLuminImages(api: LuminApi, rows: LuminGame[]): Promise<Entry[]> {
  return Promise.all(rows.map(async (game) => {
    let thumbnailUrl = ''
    if (game.image_token) {
      try { thumbnailUrl = await api.getImageUrl(game.image_token) } catch { thumbnailUrl = '' }
    }
    const id = String(game.id)
    return { id, title: game.name || game.title || 'Untitled game', thumbnailUrl, category: game.category, description: game.description, source: 'luminsdk' as const, sdkId: id, sdkImageToken: game.image_token }
  }))
}

function entryToGame(entry: Entry, playUrl = entry.playUrl ?? ''): Game {
  const fallback = { accent: '#80d99a', secondaryAccent: '#244a31', symbol: (entry.title.trim()[0] || 'G').toUpperCase() }
  return {
    slug: `${entry.source}-${entry.id}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''),
    title: entry.title,
    genre: entry.category || 'Arcade',
    description: entry.description || `A game from the ${entry.source} catalog.`,
    tags: [entry.source, entry.category || 'Games'],
    thumbnailUrl: entry.thumbnailUrl,
    bannerUrl: entry.thumbnailUrl,
    playUrl,
    launchMode: 'iframe',
    sourceType: 'external-link',
    provider: entry.source === 'gn-math' ? 'GN-Math' : entry.source === 'luminsdk' ? 'LuminSDK' : entry.source === 'seraph' ? 'Seraph' : 'LUMEN',
    licenseUrl: null,
    featured: false,
    multiplayer: false,
    accent: fallback.accent,
    secondaryAccent: fallback.secondaryAccent,
    symbol: fallback.symbol,
  }
}

function sourceEntry(game: Game): Entry {
  return { id: game.slug, title: game.title, thumbnailUrl: game.thumbnailUrl, source: 'lumen', category: game.genre, description: game.description, playUrl: game.playUrl, localGame: game }
}

function GameTile({ entry, saved, busy, onOpen, onSave }: { entry: Entry; saved: boolean; busy: boolean; onOpen: () => void; onSave?: () => void }) {
  const [imageError, setImageError] = useState(false)
  return <article className="lumen-game-tile">
    <button type="button" className="lumen-game-art" aria-label={`Play ${entry.title}`} onClick={onOpen}>
      {!imageError && entry.thumbnailUrl ? <img src={entry.thumbnailUrl} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setImageError(true)} /> : <span className="lumen-game-fallback">{entry.title.trim()[0]?.toUpperCase() || 'G'}</span>}
      {busy && <span className="lumen-game-loading"><LoaderCircle aria-hidden="true"/></span>}
    </button>
    <div className="lumen-game-info"><div className="lumen-game-title-wrap"><button type="button" className="lumen-game-title" onClick={onOpen} title={entry.title}>{entry.title}</button>{entry.source === 'lumen' && <small>{entry.category} · LUMEN</small>}</div>{onSave && <button type="button" onClick={onSave} aria-label={saved ? `Remove ${entry.title} from library` : `Save ${entry.title}`} aria-pressed={saved} className={saved ? 'is-saved' : ''}><Bookmark aria-hidden="true"/></button>}</div>
  </article>
}

export function GamesCatalogPage({ games, savedGames, onSave, onPlay, query, onQuery, category, categories, onCategory, sort, onSort }: Props) {
  const [source, setSource] = useState<SourceId>('gn-math')
  const [providerEntries, setProviderEntries] = useState<Entry[]>([])
  const [providerLoading, setProviderLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [providerError, setProviderError] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [luminTotal, setLuminTotal] = useState<number | null>(null)
  const [luminNextPage, setLuminNextPage] = useState(2)
  const [luminHasMore, setLuminHasMore] = useState(false)
  const [launchingId, setLaunchingId] = useState('')
  const requestId = useRef(0)

  useEffect(() => () => {
    if (luminSdkReady) {
      try { window.Lumin?.destroy?.() } catch { /* The provider may already be torn down. */ }
      luminSdkReady = null
      document.getElementById('lumen-luminsdk')?.remove()
    }
  }, [])

  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [source, query])

  useEffect(() => {
    if (source !== 'gn-math') return
    let active = true
    const id = ++requestId.current
    setProviderEntries([]); setProviderError(''); setProviderLoading(true)
    fetch(GN_MATH_CATALOG, { cache: 'force-cache' }).then(async (response) => {
      if (!response.ok) throw new Error(`GN-Math returned HTTP ${response.status}.`)
      return response.json()
    }).then((data: unknown) => {
      if (!Array.isArray(data)) throw new Error('GN-Math returned an unexpected catalog format.')
      const entries: Entry[] = data.filter((game): game is { id: number | string; name: string; cover?: string; url?: string; special?: string | string[] } => Boolean(game && typeof game === 'object' && 'id' in game && 'name' in game && Number((game as { id: number }).id) >= 0 && typeof (game as { name?: unknown }).name === 'string' && !(game as { name: string }).name.startsWith('[!]')))
        .map((game) => ({ id: String(game.id), title: game.name.trim(), thumbnailUrl: String(game.cover || '').replace('{COVER_URL}/', GN_MATH_COVERS), category: Array.isArray(game.special) ? game.special.join(', ') : game.special, source: 'gn-math' as const, playUrl: `https://gn-math.dev/games.html?id=${encodeURIComponent(String(game.id))}` }))
      if (active && id === requestId.current) { setProviderEntries(entries); setProviderLoading(false) }
    }).catch((error: unknown) => {
      if (active && id === requestId.current) { setProviderError(error instanceof Error ? error.message : 'Could not load GN-Math games.'); setProviderLoading(false) }
    })
    return () => { active = false }
  }, [source, retryToken])

  useEffect(() => {
    if (source !== 'luminsdk') return
    let active = true
    const id = ++requestId.current
    const timer = window.setTimeout(() => {
      setProviderEntries([]); setProviderError(''); setProviderLoading(true); setLuminTotal(null); setLuminHasMore(false); setLuminNextPage(2)
      void (async () => {
        const api = await getLuminApi()
        const response = await api.getGames({ page: 1, limit: PAGE_SIZE, ...(query.trim() ? { q: query.trim() } : {}) })
        const rows = gamesFromResponse(response)
        const entries = await withLuminImages(api, rows)
        const meta = response && typeof response === 'object' && !Array.isArray(response) ? response as LuminResponse : null
        if (!active || id !== requestId.current) return
        setProviderEntries(entries)
        setLuminTotal(typeof meta?.total === 'number' ? meta.total : entries.length)
        setLuminHasMore(typeof meta?.pages === 'number' ? meta.pages > 1 : rows.length > 0)
        setProviderLoading(false)
      })().catch((error: unknown) => {
        if (active && id === requestId.current) { setProviderError(error instanceof Error ? error.message : 'Could not load LuminSDK games.'); setProviderLoading(false) }
      })
    }, query.trim() ? 300 : 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [source, query, retryToken])

  const entries = useMemo<Entry[]>(() => {
    if (source === 'lumen') return games.map(sourceEntry)
    if (source === 'seraph') return SERAPH_CATALOG.map((game) => ({ id: game.id, title: game.title, thumbnailUrl: game.thumbnailUrl, source: 'seraph' as const, playUrl: game.playUrl }))
    return providerEntries
  }, [source, games, providerEntries])
  const filteredEntries = useMemo(() => {
    if (source === 'lumen') return entries
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return entries
    return entries.filter((entry) => `${entry.title} ${entry.category || ''} ${entry.description || ''} ${entry.source}`.toLocaleLowerCase().includes(needle))
  }, [source, entries, query])
  const visibleEntries = filteredEntries.slice(0, visibleCount)
  const count = source === 'luminsdk' && !query.trim() ? luminTotal ?? providerEntries.length : filteredEntries.length
  const sourceInfo = sourceTabs.find((item) => item.id === source)!

  const playEntry = useCallback(async (entry: Entry) => {
    setProviderError('')
    if (entry.localGame) { onPlay(entry.localGame); return }
    let playUrl = entry.playUrl || ''
    if (entry.source === 'luminsdk') {
      setLaunchingId(entry.id)
      try {
        const api = await getLuminApi()
        const value = await api.getGameUrl(entry.sdkId || entry.id)
        playUrl = typeof value === 'string' ? value : value.url || ''
        if (!playUrl || new URL(playUrl).protocol !== 'https:') throw new Error('LuminSDK did not return a secure game URL.')
      } catch (error) {
        setProviderError(error instanceof Error ? error.message : 'Could not launch this LuminSDK game.')
        setLaunchingId('')
        return
      }
      setLaunchingId('')
    }
    onPlay(entryToGame(entry, playUrl))
  }, [onPlay])

  const loadMore = async () => {
    if (source === 'luminsdk' && luminHasMore) {
      setLoadingMore(true); setProviderError('')
      const id = ++requestId.current
      try {
        const api = await getLuminApi()
        const response = await api.getGames({ page: luminNextPage, limit: PAGE_SIZE, ...(query.trim() ? { q: query.trim() } : {}) })
        const rows = gamesFromResponse(response)
        const entries = await withLuminImages(api, rows)
        if (id !== requestId.current) return
        if (!entries.length) { setLuminHasMore(false); return }
        setProviderEntries((current) => [...current, ...entries])
        setVisibleCount((current) => current + entries.length)
        const meta = response && typeof response === 'object' && !Array.isArray(response) ? response as LuminResponse : null
        setLuminHasMore(typeof meta?.pages === 'number' ? luminNextPage < meta.pages : entries.length > 0)
        setLuminNextPage((current) => current + 1)
      } catch (error) {
        if (id === requestId.current) setProviderError(error instanceof Error ? error.message : 'Could not load more LuminSDK games.')
      } finally { setLoadingMore(false) }
      return
    }
    setVisibleCount((current) => current + PAGE_SIZE)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => event.preventDefault()
  const loading = source !== 'lumen' && source !== 'seraph' && providerLoading
  const canLoadMore = filteredEntries.length > visibleCount || (source === 'luminsdk' && luminHasMore)

  return <section className="lumen-games-page" aria-label="Games catalog">
    <header className="lumen-games-brand"><span>LUMEN</span><small>GAMES</small></header>
    <div className="lumen-games-panel">
      <div className="lumen-provider-toolbar">
        <nav className="lumen-provider-tabs" aria-label="Game catalog source">
          {sourceTabs.map((tab) => <button key={tab.id} type="button" onClick={() => { setSource(tab.id); setProviderError(''); setVisibleCount(PAGE_SIZE) }} aria-pressed={source === tab.id} className={`lumen-provider-tab${source === tab.id ? ' is-active' : ''}`} title={tab.id === 'lumen' ? 'LUMEN curated games' : `Browse ${tab.label} games`}><span className="lumen-provider-mark" aria-hidden="true">{tab.id === 'gn-math' ? 'gn' : tab.id === 'luminsdk' ? '✦' : tab.id === 'seraph' ? '⚡' : 'L'}</span>{tab.label}</button>)}
        </nav>
        <form className="lumen-provider-search" role="search" onSubmit={submit}>
          <Search aria-hidden="true"/><input value={query} onChange={(event) => onQuery(event.target.value)} aria-label="Search games" placeholder="Search games…" />
          {query && <button type="button" className="lumen-provider-clear" onClick={() => onQuery('')} aria-label="Clear search">×</button>}
          <button type="submit" aria-label="Search catalog"><ArrowUpRight aria-hidden="true"/></button>
        </form>
      </div>
      <div className="lumen-catalog-summary"><span>{loading ? 'Loading games…' : `${count.toLocaleString()} ${count === 1 ? 'game' : 'games'}`}</span>{source !== 'lumen' && <a href={sourceInfo.href} target="_blank" rel="noopener noreferrer">Source catalog</a>}</div>
      {source === 'lumen' && <div className="lumen-local-catalog-tools"><label htmlFor="game-genre">Genre</label><select id="game-genre" value={category} onChange={(event) => onCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><label htmlFor="game-sort">Sort</label><select id="game-sort" value={sort} onChange={(event) => onSort(event.target.value)}><option>Featured</option><option>A–Z</option><option>Recently added</option></select></div>}
      {providerError && <div role="alert" className="lumen-provider-error"><span>{providerError}</span><button type="button" onClick={() => setRetryToken((token) => token + 1)}>Retry</button></div>}
      {loading && providerEntries.length === 0 ? <div className="lumen-catalog-loading" role="status"><LoaderCircle aria-hidden="true"/>Loading {source} games…</div> : visibleEntries.length ? <div className="lumen-game-grid" aria-label={`${source} games`}>
        {visibleEntries.map((entry) => <GameTile key={`${entry.source}-${entry.id}`} entry={entry} busy={launchingId === entry.id} saved={Boolean(entry.localGame && savedGames.includes(entry.localGame.slug))} onOpen={() => { void playEntry(entry) }} onSave={entry.localGame ? () => onSave(entry.localGame!) : undefined} />)}
      </div> : <div className="lumen-empty-catalog"><Gamepad2 aria-hidden="true"/><h2>{query ? 'No games match that search' : 'No games to show'}</h2><p>{query ? 'Try a shorter title or clear the search.' : 'The catalog may be temporarily unavailable.'}</p>{query && <button type="button" onClick={() => onQuery('')}>Clear search</button>}</div>}
      {canLoadMore && <button type="button" className="lumen-load-more" disabled={loadingMore} onClick={() => { void loadMore() }}>{loadingMore && <LoaderCircle aria-hidden="true"/>}{loadingMore ? 'Loading…' : 'Load more games'}</button>}
      {source === 'seraph' && <p className="lumen-provider-credit">Seraph catalog and game files are served from the <a href="https://github.com/a456pur/seraph" target="_blank" rel="noopener noreferrer">Seraph open-source project</a>.</p>}
    </div>
  </section>
}
