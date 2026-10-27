'use client'

import { useCallback, useSyncExternalStore } from 'react'

/* ============================================================
   Saved places

   A heart on a card keeps the place in this browser, and nowhere
   else: there are no accounts, and a list of where someone means to
   travel is theirs. Kept in localStorage, read and written inside
   try/catch — a private window or blocked storage just means nothing
   is remembered — and shared between every heart on the page through
   one event, so saving on a card lights the same place's heart on
   the map and on its page.
   ============================================================ */

const KEY = 'travel:saved'
const EVENT = 'travel:saved'

function read(): string {
	try {
		return localStorage.getItem(KEY) ?? '[]'
	} catch {
		return '[]'
	}
}

function subscribe(onChange: () => void) {
	window.addEventListener(EVENT, onChange)
	window.addEventListener('storage', onChange)
	return () => {
		window.removeEventListener(EVENT, onChange)
		window.removeEventListener('storage', onChange)
	}
}

/** The saved slugs, newest first, and a toggle. Empty on the server and until the browser answers. */
export function useSaved() {
	const raw = useSyncExternalStore(subscribe, read, () => '[]')
	let saved: string[] = []
	try {
		saved = JSON.parse(raw) as string[]
	} catch {
		saved = []
	}

	const toggle = useCallback((slug: string) => {
		let list: string[] = []
		try {
			list = JSON.parse(read()) as string[]
		} catch {
			list = []
		}
		const next = list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list]
		try {
			localStorage.setItem(KEY, JSON.stringify(next))
		} catch {
			// Storage refused: the heart simply does not stay lit.
		}
		window.dispatchEvent(new Event(EVENT))
	}, [])

	return { saved, has: (slug: string) => saved.includes(slug), toggle }
}
