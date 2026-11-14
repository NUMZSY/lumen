import Link from 'next/link'
import { ArrowUpRight, Calculator, Gamepad2, MessageCircle, NotebookPen, Timer, Tv } from 'lucide-react'

const shortcuts = [
  { label: 'Games', href: '/games', icon: Gamepad2, tone: 'text-emerald-200 bg-emerald-400/10' },
  { label: 'Watch', href: '/watch', icon: Tv, tone: 'text-blue-200 bg-blue-400/10' },
  { label: 'Notes', href: '/apps/notes', icon: NotebookPen, tone: 'text-amber-200 bg-amber-400/10' },
  { label: 'Calculator', href: '/apps/calculator', icon: Calculator, tone: 'text-cyan-200 bg-cyan-400/10' },
  { label: 'Timer', href: '/apps/timer', icon: Timer, tone: 'text-pink-200 bg-pink-400/10' },
  { label: 'Chat', href: '/chat', icon: MessageCircle, tone: 'text-emerald-200 bg-emerald-400/10' },
]

export function QuickLaunch() {
  return <section aria-labelledby="quick-launch-title" className="lumen-dock rounded-[28px] border border-white/[.1] bg-black/20 p-3 shadow-2xl backdrop-blur-xl sm:p-4"><div className="mb-3 flex items-center justify-between px-2"><h2 id="quick-launch-title" className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/55">Quick launch</h2><span className="text-[10px] text-white/30">Your LUMEN dock</span></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{shortcuts.map(({ label, href, icon: Icon, tone }) => <Link key={href} href={href} className="group flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[.08] bg-white/[.035] px-3 text-[10px] text-white/65 transition hover:border-emerald-300/25 hover:bg-emerald-300/10 hover:text-white"><span className={`grid size-7 place-items-center rounded-full ${tone}`}><Icon aria-hidden="true" className="size-3.5" /></span><span>{label}</span></Link>)}</div><Link href="/apps" className="mt-3 inline-flex items-center gap-1 px-2 text-[11px] text-emerald-200 hover:text-white">Browse all apps <ArrowUpRight aria-hidden="true" className="size-3" /></Link></section>
}
