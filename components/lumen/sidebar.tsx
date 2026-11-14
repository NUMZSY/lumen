import Link from 'next/link'
import { Bookmark, Gamepad2, Home, MessageCircle, Search, Settings2, Tv, Wrench } from 'lucide-react'

const primary = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/watch', label: 'Watch', icon: Tv },
  { href: '/apps', label: 'Apps', icon: Wrench },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
]
const secondary = [
  { href: '/library', label: 'Library', icon: Bookmark },
  { href: '/settings', label: 'Settings', icon: Settings2 },
]

export function Sidebar({ pathname }: { pathname: string }) {
  const renderItem = ({ href, label, icon: Icon }: typeof primary[number]) => {
    const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
    return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs transition ${active ? 'bg-emerald-300 text-[#171321] shadow-[0_8px_22px_rgba(167,139,250,.16)]' : 'text-white/48 hover:bg-white/[.06] hover:text-white'}`}><Icon aria-hidden="true" className={`size-4 transition ${active ? '' : 'group-hover:text-emerald-200'}`} />{label}{active && <span className="ml-auto size-1.5 rounded-full bg-[#171321]/45"/>}</Link>
  }
  return <aside className="lumen-sidebar hidden lg:block"><div className="sticky top-24 flex min-h-[calc(100vh-130px)] flex-col rounded-[24px] border border-white/[.08] bg-black/20 p-3 shadow-2xl backdrop-blur-xl"><div><p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[.22em] text-white/30">Workspace</p><nav aria-label="LUMEN sections" className="flex flex-col gap-1">{primary.map(renderItem)}</nav></div><div className="mt-8 border-t border-white/[.07] pt-6"><p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[.22em] text-white/30">Personal</p><nav aria-label="Personal sections" className="flex flex-col gap-1">{secondary.map(renderItem)}</nav></div><div className="mt-auto rounded-2xl border border-emerald-300/10 bg-emerald-300/[.04] p-4"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.7)]"/><span className="text-[9px] font-semibold uppercase tracking-[.16em] text-emerald-200/75">Local mode</span></div><p className="mt-3 text-[11px] font-medium text-white/75">Your space is ready.</p><p className="mt-1 text-[10px] leading-4 text-white/35">Favorites and history stay on this device.</p></div></div></aside>
}
