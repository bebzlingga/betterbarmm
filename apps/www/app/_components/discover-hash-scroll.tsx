'use client'

import { useEffect } from 'react'

function scrollToHash(hash: string, resetBeforeScroll = false) {
	const id = hash.replace(/^#/, '')
	const target = document.getElementById(id)

	if (!target) {
		return
	}

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

	if (resetBeforeScroll && !prefersReducedMotion) {
		window.scrollTo({ top: 0, behavior: 'auto' })
	}

	window.requestAnimationFrame(() => {
		target.scrollIntoView({
			behavior: prefersReducedMotion ? 'auto' : 'smooth',
			block: 'start',
		})
	})
}

export function DiscoverHashScroll() {
	useEffect(() => {
		if (window.location.hash) {
			window.requestAnimationFrame(() => {
				scrollToHash(window.location.hash, true)
			})
		}

		function handleHashChange() {
			if (window.location.hash) {
				scrollToHash(window.location.hash)
			}
		}

		function handleClick(event: MouseEvent) {
			const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]')

			if (!link) {
				return
			}

			const hash = link.hash

			if (!hash) {
				return
			}

			event.preventDefault()
			window.history.pushState(null, '', hash)
			scrollToHash(hash)
		}

		window.addEventListener('hashchange', handleHashChange)
		document.addEventListener('click', handleClick)

		return () => {
			window.removeEventListener('hashchange', handleHashChange)
			document.removeEventListener('click', handleClick)
		}
	}, [])

	return null
}
