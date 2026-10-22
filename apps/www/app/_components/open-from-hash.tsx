'use client'

import { useEffect } from 'react'

/* A link from the Directory lands on one service, as #service-…; this opens
   that row's <details> so the reader arrives on what to bring, not on a
   closed row they then have to find and click. */
export function OpenFromHash() {
	useEffect(() => {
		const open = () => {
			const id = decodeURIComponent(location.hash.slice(1))
			const details = id ? document.getElementById(id)?.querySelector('details') : null
			if (details) details.open = true
		}
		open()
		window.addEventListener('hashchange', open)
		return () => window.removeEventListener('hashchange', open)
	}, [])
	return null
}
