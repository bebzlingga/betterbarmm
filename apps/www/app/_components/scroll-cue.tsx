'use client'

import { ArrowDownIcon } from '@phosphor-icons/react'
import { useReducedMotion } from 'motion/react'

/**
 * The circled arrow at the foot of a full-height opening screen.
 *
 * Two jobs. It says there is something under the fold, which a masthead that
 * fills the window cannot say for itself; and it takes the reader there without
 * the page appearing to teleport.
 *
 * The smoothing is done here rather than with `scroll-behavior: smooth` on
 * `html`, because the router scrolls to the top on every navigation and a
 * global smooth scroll turns that instant jump into an animation the next
 * page's render races — the stylesheet says as much where it declines to set
 * it. An anchor that wants smoothing asks for it, which is what this is.
 *
 * Reduced motion gets the jump instead, and the fragment is written to the URL
 * either way so the link still behaves like a link.
 */
export function ScrollCue({
	to,
	label = 'Read on',
	className = '',
}: {
	/** A fragment — `#why`. */
	to: string
	label?: string
	className?: string
}) {
	const reduced = useReducedMotion()

	return (
		<a
			href={to}
			onClick={(event) => {
				const target = document.querySelector(to)
				if (!target) return

				event.preventDefault()
				target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
				window.history.pushState(null, '', to)
			}}
			className={`inline-flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)] transition hover:text-[var(--accent)] ${className}`}
		>
			<span className='bb-cue flex size-9 items-center justify-center rounded-full border border-[var(--brass-line)]'>
				<ArrowDownIcon className='size-3.5' aria-hidden='true' />
			</span>
			{label}
		</a>
	)
}
