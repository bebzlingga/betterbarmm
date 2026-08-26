'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { EASE } from './motion'

/* Two icons, drawn here rather than imported.
 *
 * Every app in the estate has `@phosphor-icons/react`, but this package does
 * not and should not: a shared layer that drags an icon library behind it can
 * only be used by an app that already has the same one at the same version.
 * Two twelve-line paths are cheaper than that constraint. */

function ArrowRight({ className }: { className?: string }) {
	return (
		<svg
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth={2.5}
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
			className={className}
		>
			<path d='M4 12h15M13 6l6 6-6 6' />
		</svg>
	)
}

function Check({ className }: { className?: string }) {
	return (
		<svg
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth={2.5}
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
			className={className}
		>
			<path d='M4.5 12.5l5 5 10-11' />
		</svg>
	)
}

/**
 * Newsletter sign-up.
 *
 * There is no mailing-list backend wired up yet, so a submit captures intent
 * client-side and shows a confirmation. Swap the handler for a real endpoint
 * (or a form action) when the list is ready.
 *
 * The field is square and the button squares with it, because every other
 * control on this site is — the shared `.field` and `.btn` are pills, which is
 * right for the registry workspaces and wrong on a page of hairlines and
 * display type.
 */
export function SubscribeForm({ className = '' }: { className?: string }) {
	const [email, setEmail] = useState('')
	const [done, setDone] = useState(false)

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		if (!email) return
		setDone(true)
	}

	return (
		<div className={className}>
			<AnimatePresence mode='wait' initial={false}>
				{done ? (
					<motion.p
						key='done'
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.35, ease: EASE }}
						className='flex items-center gap-3 border-b border-[var(--brass-line)] py-4 text-sm text-[var(--ink-2)]'
					>
						<Check className='size-4 shrink-0 text-[var(--brass)]' />
						Thanks — we&rsquo;ll keep you posted.
					</motion.p>
				) : (
					<motion.form
						key='form'
						onSubmit={handleSubmit}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.35, ease: EASE }}
						className='flex w-full items-stretch gap-2'
					>
						<input
							type='email'
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder='you@email.com'
							aria-label='Email address'
							className='min-w-0 flex-1 border border-[var(--rule)] bg-[var(--paper-2)] px-4 py-3 font-title text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-mute)] focus:border-[var(--brass)] focus:bg-[var(--paper-3)]'
						/>
						<button type='submit' className='bb-btn bb-btn-brass shrink-0 !px-5'>
							Subscribe
							<ArrowRight className='size-3.5' />
						</button>
					</motion.form>
				)}
			</AnimatePresence>
		</div>
	)
}
