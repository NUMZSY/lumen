'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Compass, Gamepad2, Grid2X2, Home, MessageCircle, Search, Settings2, Tv, type LucideIcon } from 'lucide-react'

const destinations: { href: string; label: string; icon: LucideIcon; group: string }[] = [
  { href: '/', label: 'Home', icon: Home, group: 'Discover' },
  { href: '/explore', label: 'Explore', icon: Compass, group: 'Discover' },
  { href: '/games', label: 'Games', icon: Gamepad2, group: 'Discover' },
  { href: '/watch', label: 'Watch', icon: Tv, group: 'Discover' },
  { href: '/apps', label: 'Apps', icon: Grid2X2, group: 'Discover' },
  { href: '/search', label: 'Web search', icon: Search, group: 'Workspace' },
  { href: '/chat', label: 'Chat', icon: MessageCircle, group: 'Workspace' },
  { href: '/library', label: 'Library', icon: Bookmark, group: 'You' },
  { href: '/settings', label: 'Settings', icon: Settings2, group: 'You' },
]

export function Sidebar({ pathname: pathnameProp }: { pathname?: string; compact?: boolean }) {
  const currentPath = usePathname() || pathnameProp || '/'
  return <aside className="lumen-sidebar" aria-label="Sidebar">
    <div className="lumen-sidebar-brand"><Link href="/" aria-label="LUMEN home"><span className="lumen-brand-mark">L</span><span>LUMEN</span><span className="lumen-brand-live"><i />LIVE</span></Link></div>
    {['Discover', 'Workspace', 'You'].map((group) => <section key={group} className="lumen-nav-group"><p>{group}</p><nav aria-label={`${group} navigation`}>{destinations.filter((item) => item.group === group).map(({ href, label, icon: Icon }) => {
      const active = href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`)
      return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`lumen-nav-link${active ? ' is-active' : ''}`}><Icon aria-hidden="true" /><span>{label}</span>{label === 'Chat' && <span className="lumen-nav-dot" aria-label="Local demo" />}</Link>
    })}</nav></section>)}
    <div className="lumen-sidebar-note"><span className="lumen-note-icon">✦</span><div><strong>Your space, your pace.</strong><p>Favorites and history stay on this device.</p></div></div>
    <div className="lumen-sidebar-profile"><span>G</span><div><strong>Guest space</strong><small>Local profile</small></div><i /></div>
  </aside>
}
