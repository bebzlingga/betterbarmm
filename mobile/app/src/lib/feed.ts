import AsyncStorage from '@react-native-async-storage/async-storage'
import { store } from './store'

/* The app's data: the read-only feed www publishes at /app/v1 (apps/www/scripts/build-app-feed.mjs). Fetched on
   launch and on pull-to-refresh, cached, and read from the cache when offline, so the app always opens onto the
   last thing it saw. Every record has a stable id; alerts.ts compares them to know what is new.

   A development run can read a feed served from this Mac: EXPO_PUBLIC_FEED_BASE=http://<mac-ip>:8765 */

export const FEED_BASE = process.env.EXPO_PUBLIC_FEED_BASE ?? 'https://betterbarmm.com'
export const feedUrl = (name: string) => `${FEED_BASE}/app/v1/${name}.json`

export type Story = { id: string; title: string; source: string | null; summary: string | null; url: string; published: string | null; image: string | null }
export type Incident = {
	id: string; date: string; kind: string | null; title: string; summary: string | null
	province: string | null; municipality: string | null; deaths: number; injured: number; lat: number | null; lon: number | null
}
export type Bill = { id: string; number: number; title: string; summary: string | null; status: string | null; asOf: string | null; tags: string[]; url: string }
export type Act = { id: string; number: number; title: string; officialTitle: string | null; date: string | null; category: string | null; pdf: string | null; url: string }
export type Photo = { url: string; caption: string | null; author: string | null; license: string | null; page: string | null }
export type Place = {
	id: string; name: string; kind: string; area: string; municipality: string | null; summary: string | null
	detail: string[]; beforeYouGo: string[]; gettingThere: string | null; bestTime: string | null
	do: { title: string; detail: string | null }[]; images: Photo[]; url: string
}
export type Venue = {
	id: string; name: string; kind: string | null; area: string; municipality: string | null; address: string | null; note: string | null
	halal: string | null; phone: string | null; facebook: string | null; image: Photo | null; lat: number | null; lon: number | null
}
export type Manifest = { generatedAt: string; files: Record<string, { url: string; hash: string; count: number; latest: string[] }> }

type Feed = {
	news: Story[]; incidents: Incident[]; bills: Bill[]; acts: Act[]
	places: { places: Place[]; stays: Venue[]; eats: Venue[] }
	updated: number | null; loading: boolean; error: string | null
}

export const feed = store<Feed>({
	news: [], incidents: [], bills: [], acts: [], places: { places: [], stays: [], eats: [] },
	updated: null, loading: false, error: null,
})

const FILES = ['news', 'incidents', 'bills', 'acts', 'places'] as const

/** One feed file, fetched; a copy is kept for the next launch. */
export async function fetchFile<T>(name: string): Promise<T> {
	const res = await fetch(feedUrl(name))
	if (!res.ok) throw new Error(`${name}: ${res.status}`)
	const text = await res.text()
	AsyncStorage.setItem(`feed:${name}`, text).catch(() => {})
	return JSON.parse(text)
}

/** The cached copy, before the network answers. */
export async function loadCache() {
	const entries = await Promise.all(FILES.map(async (name) => [name, await AsyncStorage.getItem(`feed:${name}`)] as const))
	const cached: Partial<Feed> = {}
	for (const [name, raw] of entries) if (raw) (cached as Record<string, unknown>)[name] = JSON.parse(raw)
	feed.set((f) => ({ ...f, ...cached }))
}

export async function refresh() {
	feed.set((f) => ({ ...f, loading: true }))
	try {
		const [news, incidents, bills, acts, places] = await Promise.all([
			fetchFile<Story[]>('news'), fetchFile<Incident[]>('incidents'), fetchFile<Bill[]>('bills'),
			fetchFile<Act[]>('acts'), fetchFile<Feed['places']>('places'),
		])
		feed.set({ news, incidents, bills, acts, places, updated: Date.now(), loading: false, error: null })
	} catch {
		// Offline, or the feed is down: keep the cache and say so once.
		feed.set((f) => ({ ...f, loading: false, error: 'Showing saved data — couldn’t reach BetterBARMM.' }))
	}
}

// ---- Formatting

export const parseDate = (s: string | null) => (s ? new Date(s.length === 10 ? `${s}T00:00:00+08:00` : s) : null)

export function ago(s: string | null) {
	const d = parseDate(s)
	if (!d || isNaN(+d)) return ''
	const mins = Math.round((Date.now() - +d) / 60000)
	if (mins < 60) return `${Math.max(mins, 1)}m ago`
	if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`
	if (mins < 60 * 24 * 7) return `${Math.round(mins / 1440)}d ago`
	return pretty(s)
}

export function pretty(s: string | null) {
	const d = parseDate(s)
	return d && !isNaN(+d) ? d.toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }) : (s ?? '')
}

/** "lanao-del-sur" → "Lanao del Sur". */
export function areaName(slug: string) {
	if (slug === 'tawi-tawi') return 'Tawi-Tawi'
	return slug
		.split('-')
		.map((w, i) => (i > 0 && ['del', 'de', 'and'].includes(w) ? w : w[0].toUpperCase() + w.slice(1)))
		.join(' ')
}

/** WordPress serves "photo-150x150.jpg" as a thumbnail; the photo itself is "photo.jpg". */
export const fullSize = (url: string | null) => url?.replace(/-\d+x\d+(?=\.\w+$)/, '') ?? null

/** Wikimedia serves a photo at standard widths (250, 330, 500, 960, 1280); ask for one that fits. */
export const thumb = (url: string | null | undefined, width: 330 | 500 | 960 | 1280) =>
	url?.includes('wikimedia.org') ? url.replace(/\/\d+px-/, `/${width}px-`) : (url ?? null)

/** A bill's label takes the accent once it is past committee; earlier stages stay quiet. */
export const stageColor = (status: string | null, accent: string, quiet: string) =>
	/third|approved|enacted|second/i.test(status ?? '') ? accent : quiet
