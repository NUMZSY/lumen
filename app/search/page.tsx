import type { Metadata } from 'next'
import { LumenAppShell } from '@/components/lumen/app-shell'
export const metadata: Metadata = { title: 'Web Search', description: 'Search and browse inside LUMEN using your selected proxy engine.' }
export default function SearchPage() { return <LumenAppShell /> }
