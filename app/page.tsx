import type { Metadata } from 'next'
import { LumenAppShell } from '@/components/lumen/app-shell'

export const metadata: Metadata = { title: 'LUMEN — Play, Watch, Explore', description: 'A quiet forest home for play, watch, create, and explore.' }

export default function HomePage() { return <LumenAppShell /> }
