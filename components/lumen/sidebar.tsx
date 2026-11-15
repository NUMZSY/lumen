'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Compass, Eye, Gamepad2, Grid2X2, Home, MessageCircle, Search, Settings2, Tv, type LucideIcon } from 'lucide-react'
import { useState } from 'react'

const destinations: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/watch', label: 'Watch', icon: Eye },
  { href: '/apps', label: 'Apps', icon: Grid2X2 },
  { href: '/search', label: 'Web search', icon: Compass },
  { href: '/library', label: 'Library', icon: Bookmark },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/explore', label: 'Explore', icon: Search },
  { href: '/settings', label: 'Settings', icon: Settings2 },
]
export function Sidebar({ pathname: pathnameProp }: { pathname?: string; compact?: boolean }) {
  const currentPath = usePathname() || pathnameProp || '/'
  const [expanded, setExpanded] = useState(false)
  return <aside className={`lumen-sidebar${expanded ? ' is-expanded' : ''}`} aria-label="LUMEN navigation">
    <nav aria-label="LUMEN sections">{destinations.map(({ href, label, icon: Icon }) => {
      const active = href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`)
      return <Link key={href} href={href} title={label} aria-label={label} aria-current={active ? 'page' : undefined} className={`lumen-nav-link${active ? ' is-active' : ''}`}><Icon aria-hidden="true" /><span>{label}</span></Link>
    })}</nav>
    <button className="lumen-rail-toggle" type="button" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'} aria-expanded={expanded}><span>{expanded ? '‹' : '›'}</span></button>
  </aside>
}
