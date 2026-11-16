export type AppItem = {
  slug: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  route: string
  featured?: boolean
}

export const apps: AppItem[] = [
  { slug: 'gauth', name: 'Gauth', description: 'AI study help and step-by-step homework support.', category: 'Study', icon: 'GraduationCap', color: 'cyan', route: 'https://www.gauthmath.com/', featured: true },
  { slug: 'discord', name: 'Discord', description: 'Open Discord in a dedicated launcher tile.', category: 'Social', icon: 'MessageCircle', color: 'violet', route: 'https://discord.com/app', featured: true },
  { slug: 'yapper', name: 'Yapper', description: 'Talk, call, and share with your communities.', category: 'Social', icon: 'MessagesSquare', color: 'blue', route: 'https://www.yapper.website/', featured: true },
  { slug: 'tubi', name: 'Tubi', description: 'Free movies, shows, and live TV from Tubi.', category: 'Watch', icon: 'Tv', color: 'pink', route: 'https://tubitv.com/', featured: true },
  { slug: 'cinecat', name: 'Cinecat', description: 'A movie and TV discovery destination.', category: 'Watch', icon: 'Clapperboard', color: 'amber', route: 'https://cinecat.eu/', featured: true },
  { slug: 'p-stream', name: 'P-Stream', description: 'Open the P-Stream project hub when available.', category: 'Watch', icon: 'PlaySquare', color: 'violet', route: 'https://github.com/p-stream', featured: true },
  { slug: 'lumin-games', name: 'LuminSDK', description: 'Browse the LuminSDK browser-game library.', category: 'Games', icon: 'Gamepad2', color: 'green', route: 'https://luminsdk.com/', featured: true },
  { slug: 'gn-math', name: 'GN-Math', description: 'Open the GN-Math game collection and its 800+ titles.', category: 'Games', icon: 'Grid3X3', color: 'green', route: 'https://gn-math.dev/games.html', featured: true },
  { slug: 'seraph', name: 'Seraph', description: 'Open the Seraph library and its open-source game hub.', category: 'Games', icon: 'Orbit', color: 'blue', route: 'https://joemama980.github.io/', featured: true },
]

export const appBySlug = (slug: string) => apps.find((app) => app.slug === slug)
