'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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

/**
 * The tick, drawn rather than switched on.
 *
 * It arrives at the same moment as the line of thanks, and a mark that appears
 * whole reads as a state the page was already in. Stroked in, it reads as the
 * answer to what the reader just did. The stroke follows the same curve every
 * other reveal on the estate uses, and it is skipped outright for a reader who
 * has asked for less motion — the mark is still there, it simply starts done.
 */
function Check({ className, reduced }: { className?: string; reduced?: boolean | null }) {
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
			<motion.path
				d='M4.5 12.5l5 5 10-11'
				initial={reduced ? false : { pathLength: 0 }}
				animate={{ pathLength: 1 }}
				transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
			/>
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
	const [focused, setFocused] = useState(false)
	const reduced = useReducedMotion()

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
						<Check className='size-4 shrink-0 text-[var(--brass)]' reduced={reduced} />
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
						{/* The field says it has the cursor with a brass rule that runs
						    out from the left edge, rather than by changing colour under
						    the type. A fill that darkens on focus was doing the job of a
						    focus ring with the one property a reader is least likely to
						    notice — and it painted a ground under a control that the rest
						    of the estate leaves on the page's own. The rule is drawn on
						    the axis the reader is already reading along, and it is the
						    only thing here that moves. */}
						<label className='relative min-w-0 flex-1'>
							<span className='sr-only'>Email address</span>
							<input
								type='email'
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								onFocus={() => setFocused(true)}
								onBlur={() => setFocused(false)}
								placeholder='you@email.com'
								className='w-full border border-[var(--rule)] bg-transparent px-4 py-3 font-title text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-mute)] focus:border-[var(--brass-line)]'
							/>
							<motion.span
								aria-hidden='true'
								className='pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--brass)]'
								initial={false}
								animate={{ scaleX: focused ? 1 : 0 }}
								transition={{ duration: reduced ? 0 : 0.42, ease: EASE }}
							/>
						</label>

						{/* The button leans into the press and the arrow steps ahead of
						    the word on the way in. Both are small on purpose: this is the
						    last control on a long page, and a control that bounces asks
						    to be noticed more than the sentence above it does. */}
						<motion.button
							type='submit'
							className='bb-btn bb-btn-brass shrink-0 !px-5'
							initial={false}
							whileHover={reduced ? undefined : 'hover'}
							whileFocus={reduced ? undefined : 'hover'}
							whileTap={reduced ? undefined : { y: 0, scale: 0.985 }}
							variants={{ hover: { y: -1 } }}
							transition={{ duration: 0.24, ease: EASE }}
						>
							Subscribe
							<motion.span
								className='inline-flex'
								variants={{ hover: { x: 3 } }}
								transition={{ duration: 0.28, ease: EASE }}
							>
								<ArrowRight className='size-3.5' />
							</motion.span>
						</motion.button>
					</motion.form>
				)}
			</AnimatePresence>
		</div>
	)
}
