'use client'

import { XIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

/* A page over its index, full screen: a craft over the catalogue, an office or
   a town over the directory. It is drawn open on the server, so a shared link
   shows it at once, and becomes a native modal dialog in the browser: focus
   stays inside and Escape closes it. Closing returns to `home`, the index that
   stays mounted underneath, scrolled where the reader left it. */

export function OverlayDialog({
	id,
	name,
	home,
	className,
	closeClassName,
	children,
}: {
	/** Changes when another page opens inside, so it starts at the top. */
	id: string
	name: string
	/** The index to return to. */
	home: string
	/** The dialog's ground and ink. */
	className: string
	closeClassName: string
	children: React.ReactNode
}) {
	const ref = useRef<HTMLDialogElement>(null)
	const router = useRouter()

	useEffect(() => {
		const d = ref.current!
		// Open from the server as a plain dialog; reopen as a modal one.
		if (d.open) d.close()
		d.showModal()
		// A modal dialog focuses its first control, the close button, which then wears a focus ring on open.
		// Focus the dialog itself instead; Tab still reaches the button and Escape still closes.
		d.focus({ preventScroll: true })
		const html = document.documentElement
		const before = html.style.overflow
		html.style.overflow = 'hidden'
		return () => {
			html.style.overflow = before
		}
	}, [])

	// Another page opened from inside: start it at the top.
	useEffect(() => {
		ref.current?.scrollTo({ top: 0 })
	}, [id])

	const close = () => router.push(home, { scroll: false })

	return (
		<dialog
			ref={ref}
			open
			tabIndex={-1}
			aria-label={name}
			onCancel={(e) => {
				e.preventDefault()
				close()
			}}
			className={`fixed inset-0 z-[60] m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain p-0 outline-none ${className}`}
		>
			<button type='button' onClick={close} aria-label='Close' className={`fixed top-4 right-4 z-20 flex size-11 items-center justify-center transition hover:opacity-70 sm:top-5 sm:right-5 ${closeClassName}`}>
				<XIcon size={26} weight='bold' aria-hidden='true' />
			</button>
			{children}
		</dialog>
	)
}
