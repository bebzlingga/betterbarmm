'use client'

import { XIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

/* A craft over the catalogue, full screen. A native modal dialog, so focus
   stays inside and Escape closes it; closing goes back, to the catalogue it
   opened from. Links inside replace the entry rather than adding one, so a
   single back always closes it. */

export function CraftDialog({ slug, name, children }: { slug: string; name: string; children: React.ReactNode }) {
	const ref = useRef<HTMLDialogElement>(null)
	const router = useRouter()

	useEffect(() => {
		const d = ref.current!
		if (!d.open) d.showModal()
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

	const close = () => router.back()

	// "Where to see it" and the like scroll within the dialog instead of adding a #hash to history.
	const onClick = (e: React.MouseEvent) => {
		const a = (e.target as HTMLElement).closest('a[href^="#"]')
		if (!a) return
		e.preventDefault()
		ref.current?.querySelector(a.getAttribute('href')!)?.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<dialog
			ref={ref}
			aria-label={name}
			onCancel={(e) => {
				e.preventDefault()
				close()
			}}
			onClick={onClick}
			className='m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain bg-[#f4efe8] p-0 text-[#3b2419] backdrop:bg-[#2a1810]/80'
		>
			<button
				type='button'
				onClick={close}
				aria-label='Close'
				className='fixed top-4 right-4 z-20 flex size-11 items-center justify-center rounded-full bg-white text-[#3b2419] shadow-[0_10px_30px_-10px_rgba(30,12,5,0.6)] transition hover:bg-[#f4e8dc] sm:top-5 sm:right-5'
			>
				<XIcon size={20} weight='bold' aria-hidden='true' />
			</button>
			{children}
		</dialog>
	)
}
