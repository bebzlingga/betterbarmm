'use client'

import { XIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

/* A page over its index: an office or a town over the directory. It is drawn
   open on the server, so a shared link shows it at once, and becomes a native
   modal dialog in the browser: focus stays inside, Escape closes it, and so
   does a click on the dimmed index around it. Closing returns to `home`, the
   index that stays mounted underneath, scrolled where the reader left it.

   `frame`: 'full' fills the window; 'panel' is a centred panel, 80% of the
   window from a tablet up and the whole screen on a phone. The panel holds
   its own scroll, so the close button stays in its corner. */

export function OverlayDialog({
	id,
	name,
	home,
	frame = 'full',
	className,
	closeClassName,
	children,
}: {
	/** Changes when another page opens inside, so it starts at the top. */
	id: string
	name: string
	/** The index to return to. */
	home: string
	frame?: 'full' | 'panel'
	/** The dialog's ground and ink. */
	className: string
	closeClassName: string
	children: React.ReactNode
}) {
	const ref = useRef<HTMLDialogElement>(null)
	const scroller = useRef<HTMLDivElement>(null)
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
		scroller.current?.scrollTo({ top: 0 })
	}, [id])

	const close = () => router.push(home, { scroll: false })

	// Important: the browser's own dialog styles cap a modal's size and give it a margin and border.
	const size =
		frame === 'full'
			? 'h-dvh! w-full! max-h-none! max-w-none!'
			: 'h-dvh! w-full! max-h-none! max-w-none! md:h-[88dvh]! md:w-[80vw]! md:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]'

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
			// A click that lands on the dialog element itself, not its content, is a click on the backdrop.
			onClick={(e) => {
				if (e.target === e.currentTarget) close()
			}}
			className={`fixed inset-0 z-[60] m-auto! overflow-hidden border-0! p-0! outline-none ${size} ${className}`}
		>
			<button type='button' onClick={close} aria-label='Close' className={`absolute top-4 right-4 z-20 flex size-11 items-center justify-center transition hover:opacity-70 sm:top-5 sm:right-5 ${closeClassName}`}>
				<XIcon size={26} weight='bold' aria-hidden='true' />
			</button>
			<div ref={scroller} className='h-full overflow-y-auto overscroll-contain'>
				{children}
			</div>
		</dialog>
	)
}
