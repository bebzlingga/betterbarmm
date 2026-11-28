'use client'

import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react'
import { MEMBER_CARD } from './member-avatar'
import { useEffect, useRef } from 'react'

// The page under an open profile stays put. The lock follows whether a profile is open now, not which one
// last opened or closed: `close` fires a task later, after the next profile has already opened.
const syncScroll = () => {
	document.documentElement.style.overflow = document.querySelector('dialog[open]') ? 'hidden' : ''
}

type Neighbour = { id: string; name: string; photo?: string }

const dialogId = (id: string) => `profile-${id}`

/** Close this profile and open another in its place. */
function go(from: HTMLDialogElement | null, to: string) {
	from?.close()
	const next = document.getElementById(dialogId(to)) as HTMLDialogElement | null
	next?.showModal()
	syncScroll()
}

function Face({ photo, name }: { photo?: string; name: string }) {
	return (
		// eslint-disable-next-line @next/next/no-img-element -- local portrait or the seal
		<img
			src={photo ?? '/images/members/BTA-logo.png'}
			alt=''
			aria-hidden='true'
			className={`size-11 shrink-0 rounded-full ${photo ? 'object-cover object-top' : 'bg-[var(--paper-2)] object-contain p-1.5 opacity-70'}`}
			title={name}
		/>
	)
}

/**
 * A card that opens into a profile. The card is the button; the profile is a
 * native `<dialog>`, so Escape, focus and the backdrop come with the platform.
 * Its foot steps to the Members either side, in the page's order.
 */
export function ProfileDialog({
	id,
	label,
	card,
	prev,
	next,
	children,
}: {
	id: string
	label: string
	card: React.ReactNode
	prev?: Neighbour
	next?: Neighbour
	children: React.ReactNode
}) {
	const dialog = useRef<HTMLDialogElement>(null)
	// A link inside the profile ("Full record") leaves the page with the dialog still open, and an unmounted
	// dialog never fires `close`: shut it here, or the next page cannot scroll.
	useEffect(() => {
		const el = dialog.current
		return () => {
			el?.close()
			syncScroll()
		}
	}, [])
	return (
		<>
			<button
				type='button'
				onClick={() => {
					dialog.current?.showModal()
					syncScroll()
				}}
				aria-haspopup='dialog'
				className={`w-full cursor-pointer ${MEMBER_CARD}`}
			>
				{card}
			</button>
			<dialog
				ref={dialog}
				id={dialogId(id)}
				aria-label={label}
				// Escape, the close button and the backdrop all end here.
				onClose={syncScroll}
				// A click on the backdrop lands on the dialog itself.
				onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
				className='m-auto h-[min(92vh,60rem)] max-h-none w-[min(76rem,calc(100vw-2rem))] max-w-none flex-col overflow-hidden rounded-[1.75rem] bg-[var(--paper)] p-0 text-[var(--ink)] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.55)] backdrop:bg-black/55 open:flex'
			>
				<button
					type='button'
					onClick={() => dialog.current?.close()}
					aria-label='Close'
					className='absolute right-4 top-4 z-10 grid size-10 cursor-pointer place-items-center rounded-full bg-[var(--paper)] text-[var(--ink-2)] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.4)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]'
				>
					<XIcon size={18} weight='bold' aria-hidden='true' />
				</button>

				<div className='min-h-0 flex-1'>{children}</div>

				<nav aria-label='Other Members' className='grid shrink-0 grid-cols-2 gap-2 border-t border-[var(--rule-soft)] p-2'>
					{prev ? (
						<button
							type='button'
							onClick={() => go(dialog.current, prev.id)}
							className='group flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-[var(--paper-2)]'
						>
							<ArrowLeftIcon size={16} className='shrink-0 text-[var(--ink-3)] group-hover:text-[var(--accent)]' aria-hidden='true' />
							<Face photo={prev.photo} name={prev.name} />
							<span className='min-w-0'>
								<span className='block text-[0.65625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>Previous</span>
								<span className='block truncate text-[0.875rem] font-bold text-[var(--ink)] group-hover:text-[var(--accent)]'>{prev.name}</span>
							</span>
						</button>
					) : (
						<span />
					)}
					{next ? (
						<button
							type='button'
							onClick={() => go(dialog.current, next.id)}
							className='group flex min-w-0 cursor-pointer items-center justify-end gap-3 rounded-2xl px-4 py-3 text-right transition hover:bg-[var(--paper-2)]'
						>
							<span className='min-w-0'>
								<span className='block text-[0.65625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>Next</span>
								<span className='block truncate text-[0.875rem] font-bold text-[var(--ink)] group-hover:text-[var(--accent)]'>{next.name}</span>
							</span>
							<Face photo={next.photo} name={next.name} />
							<ArrowRightIcon size={16} className='shrink-0 text-[var(--ink-3)] group-hover:text-[var(--accent)]' aria-hidden='true' />
						</button>
					) : (
						<span />
					)}
				</nav>
			</dialog>
		</>
	)
}
