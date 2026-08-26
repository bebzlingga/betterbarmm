'use client'

import { useSyncExternalStore } from 'react'

export const THEME_STORAGE_KEY = 'bb-theme'

/**
 * Runs before first paint, inlined in the document head.
 *
 * Resolving the theme here rather than in React avoids the white flash a
 * dark-mode reader would otherwise get on every navigation, and it collapses
 * "stored preference or system preference" into one explicit attribute so the
 * stylesheet only has to describe two states.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var t=(s==='dark'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`

type Theme = 'light' | 'dark'

/**
 * The theme lives on the document element, not in React state, because the
 * pre-paint script sets it first. `useSyncExternalStore` reads from there so
 * the button never disagrees with the page it is sitting on, and so the
 * server render has a defined value to fall back to.
 */
function subscribe(onChange: () => void) {
	const media = window.matchMedia('(prefers-color-scheme: dark)')

	// Follow the system only while the reader hasn't made an explicit choice.
	const onSystemChange = () => {
		if (localStorage.getItem(THEME_STORAGE_KEY)) return
		document.documentElement.dataset.theme = media.matches ? 'dark' : 'light'
		onChange()
	}

	media.addEventListener('change', onSystemChange)
	window.addEventListener(THEME_STORAGE_KEY, onChange)

	return () => {
		media.removeEventListener('change', onSystemChange)
		window.removeEventListener(THEME_STORAGE_KEY, onChange)
	}
}

const getSnapshot = (): Theme =>
	document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'

const getServerSnapshot = (): Theme => 'light'

export function ThemeToggle() {
	const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
	const next: Theme = theme === 'dark' ? 'light' : 'dark'

	const toggle = () => {
		document.documentElement.dataset.theme = next
		try {
			localStorage.setItem(THEME_STORAGE_KEY, next)
		} catch {
			// Private browsing can refuse storage; the theme still applies for
			// this page, it just won't be remembered.
		}
		window.dispatchEvent(new Event(THEME_STORAGE_KEY))
	}

	return (
		<button
			type='button'
			onClick={toggle}
			title={`Switch to ${next} theme`}
			aria-label={`Switch to ${next} theme`}
			className='inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-[var(--ink-3)] transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)]'
		>
			{theme === 'dark' ? (
				<svg
					className='size-[18px]'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='1.8'
					strokeLinecap='round'
					strokeLinejoin='round'
					aria-hidden='true'
				>
					<circle cx='12' cy='12' r='4' />
					<path d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' />
				</svg>
			) : (
				<svg
					className='size-[18px]'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='1.8'
					strokeLinecap='round'
					strokeLinejoin='round'
					aria-hidden='true'
				>
					<path d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' />
				</svg>
			)}
		</button>
	)
}
