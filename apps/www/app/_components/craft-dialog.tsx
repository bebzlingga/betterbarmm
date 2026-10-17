'use client'

import { XIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

/* A craft over the catalogue, full screen. It is drawn open on the server, so a
   shared link shows the craft at once, and becomes a native modal dialog in the
   browser: focus stays inside and Escape closes it. Closing goes back to the
   catalogue it was opened from; arriving on the link itself, it replaces the
   entry with the catalogue instead of leaving the site. Links inside replace the
   entry rather than adding one, so a single back always closes it. */

export function CraftDialog({ slug, name, children }: { slug: string; name: string; children: React.ReactNode }) {
	const ref = useRef<HTMLDialogElement>(null)
	const router = useRouter()
	// Whether this craft is where the visit began: then there is no catalogue behind it in history.
	const landed = useRef(false)

	useEffect(() => {
		const entry = performance.getEntriesByType('navigation')[0]
		landed.current = !!entry && new URL(entry.name).pathname === location.pathname
		const d = ref.current!
		// Open from the server as a plain dialog; reopen as a modal one.
		if (d.open) d.close()
		d.showModal()
		const html = document.documentElement
		const before = html.style.overflow
		html.style.overflow = 'hidden'
		return () => {
			html.style.overflow = before
		}
	}, [])

	// Another craft opened from inside: start it at the top.
	useEffect(() => {
		ref.current?.scrollTo({ top: 0 })
	}, [slug])

	const close = () => (landed.current ? router.replace('/crafts', { scroll: false }) : router.back())

	return (
		<dialog
			ref={ref}
			open
			aria-label={name}
			onCancel={(e) => {
				e.preventDefault()
				close()
			}}
			className='fixed inset-0 z-[60] m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain bg-[#f4efe8] p-0 text-[#3b2419] backdrop:bg-[#2a1810]/80'
		>
			<button
				type='button'
				onClick={close}
				aria-label='Close'
				className='fixed top-4 right-4 z-20 flex size-11 items-center justify-center text-[#2a1810] transition hover:opacity-70 sm:top-5 sm:right-5'
			>
				<XIcon size={26} weight='bold' aria-hidden='true' />
			</button>
			{children}
		</dialog>
	)
}
