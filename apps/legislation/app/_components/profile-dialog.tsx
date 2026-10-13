'use client'

import { XIcon } from '@phosphor-icons/react'
import { useRef } from 'react'

/**
 * A card that opens into a profile. The card is the button; the profile is a
 * native `<dialog>`, so Escape, focus and the backdrop come with the platform.
 */
export function ProfileDialog({ label, card, children }: { label: string; card: React.ReactNode; children: React.ReactNode }) {
	const dialog = useRef<HTMLDialogElement>(null)
	return (
		<>
			<button
				type='button'
				onClick={() => dialog.current?.showModal()}
				aria-haspopup='dialog'
				className='flex h-full w-full cursor-pointer flex-col border border-[var(--rule)] bg-[var(--paper)] p-5 text-left transition hover:border-[var(--ink)]'
			>
				{card}
			</button>
			<dialog
				ref={dialog}
				aria-label={label}
				// A click on the backdrop lands on the dialog itself.
				onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
				className='m-auto max-h-[90vh] w-[min(56rem,calc(100vw-2rem))] max-w-none overflow-y-auto border border-[var(--ink)] bg-[var(--paper)] p-0 text-[var(--ink)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] backdrop:bg-black/50'
			>
				<button
					type='button'
					onClick={() => dialog.current?.close()}
					aria-label='Close'
					className='absolute right-3 top-3 z-10 grid size-9 cursor-pointer place-items-center bg-[var(--paper)] text-[var(--ink-3)] transition hover:text-[var(--ink)]'
				>
					<XIcon size={18} weight='bold' aria-hidden='true' />
				</button>
				{children}
			</dialog>
		</>
	)
}
