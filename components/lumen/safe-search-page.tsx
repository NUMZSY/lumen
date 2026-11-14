'use client'

import { ExternalLink, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

const engines = [
  { id: 'duckduckgo', label: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { id: 'google', label: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'bing', label: 'Bing', url: 'https://www.bing.com/search?q=' },
]

export function SafeSearchPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')

  const runSearch = (engineId: string) => {
    const engine = engines.find((item) => item.id === engineId) ?? engines[0]
    const term = query.trim() || 'browser games'
    window.open(`${engine.url}${encodeURIComponent(term)}`, '_blank', 'noopener,noreferrer')
    setStatus(`Opened ${engine.label} in a new browser tab.`)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    runSearch('duckduckgo')
  }

  return <section className="mx-auto max-w-3xl py-3 sm:py-8">
    <div className="rounded-[28px] border border-white/[.1] bg-[#10121b] p-5 shadow-2xl sm:p-9">
      <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.2em] text-emerald-200/75"><ShieldCheck className="size-3.5"/> Safe web search</div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Search beyond LUMEN.</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Search the wider web using a normal search-engine tab. LUMEN does not proxy, relay, or mirror arbitrary websites inside the app.</p>
      <form onSubmit={submit} className="mt-7 flex min-h-12 flex-col gap-2 rounded-2xl border border-white/10 bg-white/[.035] p-2 sm:flex-row sm:items-center">
        <Search className="ml-2 hidden size-4 shrink-0 text-emerald-200 sm:block" aria-hidden="true" />
        <label className="sr-only" htmlFor="lumen-web-search">Search the web</label>
        <input id="lumen-web-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the web..." className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-white/35" />
        <button type="submit" className="min-h-11 rounded-xl bg-emerald-300 px-4 text-xs font-semibold text-[#11121a] transition hover:bg-emerald-100">Search DuckDuckGo</button>
      </form>
      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {engines.map((engine) => <button key={engine.id} type="button" onClick={() => runSearch(engine.id)} className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/[.025] px-3 text-left text-xs text-white/70 transition hover:border-emerald-300/25 hover:bg-emerald-300/[.06] hover:text-white"><span>{engine.label}</span><ExternalLink className="size-3.5 text-white/35" aria-hidden="true" /></button>)}
      </div>
      <p className="mt-5 text-[10px] text-white/35" role="status" aria-live="polite">{status || 'Search results open in your browser, outside the LUMEN frame.'}</p>
    </div>
    <div className="mt-4 rounded-2xl border border-white/[.08] bg-white/[.02] p-4 text-[11px] leading-5 text-white/45"><strong className="font-medium text-white/70">Need LUMEN-only results?</strong> Use Explore to search the local games, watch items, and mini apps catalog without leaving the site.</div>
  </section>
}
