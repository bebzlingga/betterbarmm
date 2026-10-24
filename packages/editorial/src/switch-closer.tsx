'use client'

import { useEffect } from 'react'

/** Closes the workspace switch on a click, tap or focus outside it or Escape, which a
 *  native `<details>` does not do by itself; and when one switch opens, shuts the other,
 *  however it was opened (pointer, keyboard), for browsers that ignore `<details name>`. */
export function SwitchCloser() {
	useEffect(() => {
		const close = (keep?: EventTarget | null) => {
			for (const el of document.querySelectorAll<HTMLDetailsElement>('details.utility-bar-switch[open]'))
				if (!(keep instanceof Node && el.contains(keep))) el.open = false
		}
		const onPointer = (e: Event) => close(e.target)
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
		// `toggle` does not bubble, so it is caught on the way down.
		const onToggle = (e: Event) => {
			const el = e.target
			if (el instanceof HTMLDetailsElement && el.classList.contains('utility-bar-switch') && el.open) close(el)
		}
		document.addEventListener('pointerdown', onPointer)
		document.addEventListener('focusin', onPointer)
		document.addEventListener('keydown', onKey)
		document.addEventListener('toggle', onToggle, true)
		return () => {
			document.removeEventListener('pointerdown', onPointer)
			document.removeEventListener('focusin', onPointer)
			document.removeEventListener('keydown', onKey)
			document.removeEventListener('toggle', onToggle, true)
		}
	}, [])
	return null
}
