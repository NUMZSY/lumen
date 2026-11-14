import type { Metadata } from 'next'
import { Footer } from '@/components/lumen/footer'
import { SafeSearchPage } from '@/components/lumen/safe-search-page'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Search', description: 'Search the wider web through a normal external search tab.' }

export default function SearchPage() {
  return <div className="min-h-screen overflow-x-hidden bg-transparent text-white"><header className="lumen-topbar sticky top-0 z-40 border-b border-white/[.07] bg-[#0a0b10]/35 backdrop-blur-2xl"><nav aria-label="Search navigation" className="mx-auto flex h-[56px] max-w-[1520px] items-center justify-between gap-4 px-4 sm:px-8"><Link href="/" className="text-[15px] font-semibold tracking-[.22em]">LUMEN</Link><div className="flex items-center gap-2"><Link href="/explore" className="rounded-full px-3 py-1.5 text-xs text-white/55 hover:bg-white/[.06] hover:text-white">Explore</Link><Link href="/games" className="rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-semibold text-[#171321] hover:bg-emerald-100">Games</Link></div></nav></header><main className="mx-auto max-w-[1480px] px-4 py-4 sm:px-8 sm:py-6"><SafeSearchPage /></main><Footer /></div>
}
