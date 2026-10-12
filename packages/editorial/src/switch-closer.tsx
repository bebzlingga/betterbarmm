'use client'

import { useEffect } from 'react'

/** Closes the workspace switch on a click outside it or Escape, which a
 *  native `<details>` does not do by itself. */
export function SwitchCloser() {
	useEffect(() => {
		const close = (keep?: EventTarget | null) => {
			for (const el of document.querySelectorAll<HTMLDetailsElement>('details.utility-bar-switch[open]'))
				if (!(keep instanceof Node && el.contains(keep))) el.open = false
		}
		const onPointer = (e: PointerEvent) => close(e.target)
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
		document.addEventListener('pointerdown', onPointer)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('pointerdown', onPointer)
			document.removeEventListener('keydown', onKey)
		}
	}, [])
	return null
}
