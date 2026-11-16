'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bookmark, ChevronLeft, ChevronRight, Compass, Gamepad2, Grid2X2, Home, MessageCircle, Search, Settings2, Tv } from 'lucide-react'

const items = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/watch', label: 'Watch', icon: Tv },
  { href: '/apps', label: 'Apps', icon: Grid2X2 },
  { href: '/search', label: 'Web search', icon: Search },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/library', label: 'Library', icon: Bookmark },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/settings', label: 'Settings', icon: Settings2 },
]

type SidebarItem = typeof items[number]
type SidebarProps = { pathname: string; compact?: boolean }

export function Sidebar({ pathname }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const renderItem = ({ href, label, icon: Icon }: SidebarItem) => {
    const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
    return <Link key={href} href={href} title={label} aria-label={label} aria-current={active ? 'page' : undefined} className={`lumen-rail-item group grid place-items-center text-xs transition ${active ? 'is-active' : ''}`}>
      <Icon aria-hidden="true" className="size-4 transition group-hover:text-emerald-200" />
      <span className="sr-only">{label}</span>
    </Link>
  }

  return <aside className={`lumen-sidebar lumen-icon-rail ${collapsed ? 'is-collapsed' : ''}`}>
    <div className="lumen-icon-rail-inner">
      <nav aria-label="LUMEN navigation" className="lumen-icon-rail-nav">{items.map(renderItem)}</nav>
    </div>
    <button type="button" className="lumen-rail-toggle" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand navigation rail' : 'Minimize navigation rail'} aria-expanded={!collapsed}>
      {collapsed ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
    </button>
  </aside>
}
