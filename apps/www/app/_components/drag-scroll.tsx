'use client'

import { useEffect } from 'react'

/* Drag to scroll (user decision): with a mouse, press and hold on any sideways row — a rail of cards, a bar of
   months or categories — and drag it along, the grab cursor showing while it moves. One listener for the whole
   workspace: a row joins by being a `.dv-rail` or carrying `data-drag-scroll`. A touch screen already swipes, so
   only a mouse drags. A press that moved is not a click, so letting go over a card does not open it. */
const ROW = '.dv-rail, [data-drag-scroll]'

let drags = 0

export function DragScroll() {
	useEffect(() => {
		const down = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse' || e.button !== 0) return
			const row = (e.target as Element).closest<HTMLElement>(ROW)
			if (!row || row.scrollWidth <= row.clientWidth) return
			const x0 = e.clientX
			const left0 = row.scrollLeft
			const id = String(++drags)
			let dragging = false
			// The last few moves, to know how fast the hand was going when it let go.
			let trail: { x: number; t: number }[] = []

			const move = (m: PointerEvent) => {
				const dx = m.clientX - x0
				if (!dragging) {
					if (Math.abs(dx) < 6) return
					dragging = true
				}
				// Set on every move, so a press that catches a row still gliding takes it over.
				row.dataset.dragging = id
				row.scrollLeft = left0 - dx
				trail.push({ x: m.clientX, t: m.timeStamp })
				trail = trail.filter((p) => m.timeStamp - p.t < 100)
			}
			const up = (u: PointerEvent) => {
				window.removeEventListener('pointermove', move)
				window.removeEventListener('pointerup', up)
				if (!dragging) return

				// Glide on (user decision: smooth), slowing, and stay where it comes to rest (user decision: no snapping when
				// dragging): the row is marked free, which keeps the snap off for it from then on, arrows and all.
				const first = trail[0]
				const raw = first && u.timeStamp > first.t ? (u.clientX - first.x) / (u.timeStamp - first.t) : 0 // px per ms
				const velocity = Math.max(-3, Math.min(3, raw))
				row.dataset.free = 'true'
				row.scrollTo({ left: row.scrollLeft - velocity * 280, behavior: 'smooth' })
				const settle = () => {
					if (row.dataset.dragging === id) delete row.dataset.dragging
				}
				row.addEventListener('scrollend', settle, { once: true })
				setTimeout(settle, 900) // where scrollend never fires

				// Swallow the click this release would fire, once.
				const swallow = (c: MouseEvent) => {
					c.preventDefault()
					c.stopPropagation()
				}
				window.addEventListener('click', swallow, { capture: true, once: true })
				setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0)
			}
			window.addEventListener('pointermove', move)
			window.addEventListener('pointerup', up)
		}
		// Links and pictures in a row would otherwise start the browser's own drag of the link or image.
		const drag = (e: DragEvent) => {
			if ((e.target as Element).closest?.(ROW)) e.preventDefault()
		}
		document.addEventListener('pointerdown', down)
		document.addEventListener('dragstart', drag)
		return () => {
			document.removeEventListener('pointerdown', down)
			document.removeEventListener('dragstart', drag)
		}
	}, [])
	return null
}
