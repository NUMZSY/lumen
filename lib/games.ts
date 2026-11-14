export type GameSourceType = 'approved-embed' | 'external-link' | 'self-hosted' | 'placeholder'

export type Game = {
  slug: string
  title: string
  genre: string
  description: string
  tags: string[]
  thumbnailUrl: string
  bannerUrl: string
  playUrl: string
  launchMode?: 'iframe' | 'new-tab'
  sourceType: GameSourceType
  provider: string
  licenseUrl: string | null
  featured: boolean
  multiplayer: boolean
  addedAt?: string
  accent: string
  secondaryAccent: string
  symbol: string
}

type HostedGame = Omit<Game, 'thumbnailUrl' | 'bannerUrl' | 'sourceType'> & { thumbnailExtension?: 'png' | 'jpg' }

function hostedGame(game: HostedGame, sourceType: GameSourceType = 'approved-embed'): Game {
  const { thumbnailExtension = 'png', ...details } = game
  const thumbnailUrl = `/game-thumbnails/${game.slug}.${thumbnailExtension}`

  return {
    ...details,
    thumbnailUrl,
    bannerUrl: thumbnailUrl,
    sourceType,
    launchMode: details.launchMode ?? (sourceType === 'external-link' ? 'new-tab' : 'iframe'),
  }
}

export const games: Game[] = [
  hostedGame({
    slug: 'eaglercraft-112',
    title: 'Eaglercraft Ranked',
    genre: 'Sandbox',
    description: 'Play the browser-based Eaglercraft client from its ranked game site.',
    tags: ['Sandbox', 'Featured', 'Multiplayer'],
    playUrl: 'https://play.eaglercraftranked.com/',
    provider: 'Eaglercraft Ranked',
    licenseUrl: null,
    featured: true,
    multiplayer: true,
    addedAt: '2026-11-11',
    accent: '#9fe0a0',
    secondaryAccent: '#43704a',
    symbol: '▦',
  }),
  hostedGame({
    slug: 'databallr',
    title: 'Databallr',
    genre: 'Sports',
    description: 'Explore Databallr’s NBA and WNBA analytics, plus basketball games like ISO.',
    tags: ['Basketball', 'Sports'],
    playUrl: 'https://databallr.com/',
    launchMode: 'iframe',
    provider: 'Databallr',
    licenseUrl: null,
    featured: false,
    multiplayer: true,
    addedAt: '2026-11-12',
    accent: '#f0a064',
    secondaryAccent: '#8a4526',
    symbol: '◎',
  }, 'external-link'),
  hostedGame({
    slug: 'territorial-io',
    title: 'Territorial.io',
    genre: 'Strategy',
    description: 'Expand your territory, balance your growth, and compete for control of the map.',
    tags: ['Strategy', 'Multiplayer'],
    playUrl: 'https://territorial.io/',
    provider: 'Territorial.io',
    licenseUrl: null,
    featured: true,
    multiplayer: true,
    accent: '#73d6ff',
    secondaryAccent: '#267cb4',
    symbol: '◉',
  }),
  hostedGame({
    slug: 'krunker',
    title: 'Krunker',
    genre: 'Action',
    description: 'Fast browser FPS action with sharp movement and instant rounds.',
    tags: ['Action', 'FPS', 'Multiplayer', 'Featured'],
    playUrl: 'https://krunker.io/',
    launchMode: 'iframe',
    provider: 'Krunker',
    licenseUrl: null,
    featured: true,
    multiplayer: true,
    addedAt: '2026-11-14',
    accent: '#ff8067',
    secondaryAccent: '#9f3e35',
    symbol: '✦',
  }, 'approved-embed'),
  hostedGame({
    slug: 'betrayal-io',
    title: 'Betrayal.io',
    genre: 'Party',
    description: 'Read the room, complete tasks, and catch the secret saboteur.',
    tags: ['Party', 'Social', 'Deduction', 'Multiplayer', 'Featured'],
    playUrl: 'https://betrayal.io/',
    launchMode: 'iframe',
    provider: 'Betrayal.io',
    licenseUrl: null,
    featured: true,
    multiplayer: true,
    addedAt: '2026-11-14',
    accent: '#a58cff',
    secondaryAccent: '#4b328a',
    symbol: '◌',
  }, 'approved-embed'),
  hostedGame({
    slug: 'basket-bros',
    title: 'Basket Bros',
    genre: 'Sports',
    description: 'One-on-one hoops with quick matches and trick-shot energy.',
    tags: ['Sports', 'Basketball', 'Arcade', 'Multiplayer', 'Featured'],
    playUrl: 'https://basketbros.io/',
    launchMode: 'iframe',
    provider: 'Basket Bros',
    licenseUrl: null,
    featured: true,
    multiplayer: true,
    addedAt: '2026-11-14',
    accent: '#76cfff',
    secondaryAccent: '#2c6ca7',
    symbol: '◉',
  }, 'approved-embed'),
  hostedGame({
    slug: 'gartic-phone',
    title: 'Gartic Phone',
    genre: 'Party',
    description: 'Telephone, but with drawings. The results are always wild.',
    tags: ['Party', 'Drawing', 'Friends', 'Multiplayer', 'Featured'],
    playUrl: 'https://garticphone.com/',
    launchMode: 'iframe',
    provider: 'Gartic Phone',
    licenseUrl: null,
    featured: true,
    multiplayer: true,
    addedAt: '2026-11-14',
    accent: '#d8f36b',
    secondaryAccent: '#6d842b',
    symbol: '✎',
  }, 'approved-embed'),
  hostedGame({
    slug: 'shell-shockers',
    title: 'Shell Shockers',
    genre: 'Action',
    description: 'Eggs with attitude. Jump into a fast multiplayer shootout.',
    tags: ['Action', 'FPS', 'Multiplayer', 'Featured'],
    playUrl: 'https://shellshock.io/',
    launchMode: 'iframe',
    provider: 'Shell Shockers',
    licenseUrl: null,
    featured: true,
    multiplayer: true,
    addedAt: '2026-11-14',
    accent: '#ff9ad5',
    secondaryAccent: '#9d3f75',
    symbol: '◒',
  }, 'approved-embed'),
  hostedGame({
    slug: 'skribbl-io',
    title: 'Skribbl.io',
    genre: 'Party',
    description: 'Draw a word, guess a word, and laugh at the masterpieces.',
    tags: ['Party', 'Drawing', 'Guessing', 'Multiplayer', 'Featured'],
    playUrl: 'https://skribbl.io/',
    launchMode: 'iframe',
    provider: 'Skribbl.io',
    licenseUrl: null,
    featured: true,
    multiplayer: true,
    addedAt: '2026-11-14',
    accent: '#ffc76d',
    secondaryAccent: '#a24e2c',
    symbol: '✎',
  }, 'approved-embed'),
  hostedGame({
    slug: 'little-alchemy',
    title: 'Little Alchemy',
    genre: 'Puzzle',
    description: 'Combine simple elements and discover new materials and objects.',
    tags: ['Puzzle', 'Casual'],
    playUrl: 'https://littlealchemy.com',
    provider: 'Little Alchemy',
    licenseUrl: null,
    featured: false,
    multiplayer: false,
    accent: '#9cc9e9',
    secondaryAccent: '#4f70a5',
    symbol: '◇',
  }),
  hostedGame({
    slug: '10-bullets',
    title: '10 Bullets',
    genre: 'Arcade',
    description: 'Time one perfect shot and set off a chain reaction in this quick-fire arcade challenge.',
    tags: ['Arcade', 'New'],
    playUrl: 'https://www.crazygames.com/embed/10-bullets-html-5',
    provider: 'CrazyGames',
    licenseUrl: null,
    featured: false,
    multiplayer: false,
    addedAt: '2026-11-11',
    accent: '#bf9dff',
    secondaryAccent: '#5542b3',
    symbol: '✺',
    thumbnailExtension: 'jpg',
  }),
  hostedGame({
    slug: 'hexgl',
    title: 'HexGL',
    genre: 'Racing',
    description: 'Race a high-speed anti-gravity ship through a luminous future city in this open-source WebGL racer.',
    tags: ['Racing', 'Open source'],
    playUrl: 'https://hexgl.bkcore.com/play/',
    provider: 'bkcore',
    licenseUrl: null,
    featured: true,
    multiplayer: false,
    accent: '#ec73d5',
    secondaryAccent: '#5224a2',
    symbol: '◈',
  }),
  hostedGame({
    slug: 'tina-detective',
    title: 'Tina Detective',
    genre: 'Puzzle',
    description: 'Find clues and solve a lighthearted hidden-object mystery.',
    tags: ['Puzzle', 'Adventure'],
    playUrl: 'https://play.famobi.com/tina-detective/A1000-10',
    provider: 'Famobi',
    licenseUrl: null,
    featured: false,
    multiplayer: false,
    accent: '#dfb3ea',
    secondaryAccent: '#8d5b8d',
    symbol: '⌕',
    thumbnailExtension: 'jpg',
  }),
  hostedGame({
    slug: 'free-asteroids',
    title: 'Free Asteroids',
    genre: 'Arcade',
    description: 'Pilot through a field of asteroids in a classic arcade-style space game.',
    tags: ['Arcade', 'Space'],
    playUrl: 'https://freeasteroids.org/',
    provider: 'Free Asteroids',
    licenseUrl: null,
    featured: false,
    multiplayer: false,
    accent: '#8bb8ff',
    secondaryAccent: '#314c87',
    symbol: '✦',
  }),
]

export const categories = ['All', ...Array.from(new Set(games.map((game) => game.genre))).sort(), 'Multiplayer']
export const gameBySlug = (slug: string) => games.find((game) => game.slug === slug)

export function buildExploreHref(query: string, category: string) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (category !== 'All') params.set('category', category)
  const search = params.toString()
  return search ? `/explore?${search}` : '/explore'
}

export function buildGameHref(slug: string, returnTo?: string) {
  if (!returnTo || !returnTo.startsWith('/explore') || returnTo.startsWith('//')) return `/games/${slug}`
  return `/games/${slug}?${new URLSearchParams({ returnTo }).toString()}`
}

export type RouteSearchParams = Promise<Record<string, string | string[] | undefined>>

export function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

export function getSafeReturnHref(value: string) {
  if (!value.startsWith('/') || value.startsWith('//')) return undefined
  try {
    const parsed = new URL(value, 'https://lumen.local')
    if (parsed.origin !== 'https://lumen.local' || parsed.pathname !== '/explore') return undefined
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return undefined
  }
}

export function sourceTypeLabel(sourceType: GameSourceType) {
  if (sourceType === 'approved-embed') return 'Provider embed'
  if (sourceType === 'external-link') return 'External provider'
  if (sourceType === 'self-hosted') return 'Self-hosted'
  return 'Placeholder game'
}
