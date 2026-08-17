'use client'

import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { useState } from 'react'

/**
 * Newsletter sign-up. There is no mailing-list backend wired up yet, so a
 * submit just captures intent client-side and shows a confirmation. Swap the
 * handler for a real endpoint (or a form action) when the list is ready.
 */
export function SubscribeForm({ className = '' }: { className?: string }) {
	const [email, setEmail] = useState('')
	const [done, setDone] = useState(false)

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		if (!email) return
		setDone(true)
	}

	if (done) {
		return (
			<p className={`text-sm text-[var(--ink-2)] ${className}`}>
				Thanks — we&rsquo;ll keep you posted.
			</p>
		)
	}

	return (
		<form onSubmit={handleSubmit} className={`flex w-full items-center gap-2 ${className}`}>
			<input
				type='email'
				required
				value={email}
				onChange={(event) => setEmail(event.target.value)}
				placeholder='you@email.com'
				aria-label='Email address'
				className='field'
			/>
			<button type='submit' className='btn btn-solid btn-field h-11 shrink-0 px-5'>
				Subscribe
				<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
			</button>
		</form>
	)
}
