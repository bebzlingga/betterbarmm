'use client'

import { CheckCircleIcon } from '@phosphor-icons/react'
import { useActionState, useState } from 'react'
import { fileReport, type ReportState } from './actions'

export function ReportForm({ url, title }: { url: string; title: string }) {
	const [state, action, pending] = useActionState<ReportState, FormData>(fileReport, { ok: false, error: null })
	const [started] = useState(() => Date.now())

	if (state.ok)
		return (
			<div className='flex items-start gap-3 bg-[var(--paper-2)] p-6'>
				<CheckCircleIcon size={22} weight='fill' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
				<div>
					<p className='text-[17px] font-extrabold'>Thank you. An editor will check it against the source.</p>
					<p className='mt-2 text-[14.5px] leading-7 text-[var(--ink-2)]'>If it is wrong, it is fixed and the change shows in the record&rsquo;s history.</p>
					{url ? (
						<a href={url} className='rule-link mt-4 inline-block text-[14px] font-semibold'>
							Back to the page
						</a>
					) : null}
				</div>
			</div>
		)

	const field = 'w-full border border-[var(--rule)] bg-[var(--paper)] px-4 py-3 text-[15px] outline-none focus:border-[var(--accent)]'
	return (
		<form action={action} className='space-y-6'>
			<input type='hidden' name='started' value={started} />
			{/* Hidden from people; a bot fills it in. */}
			<input type='text' name='website' tabIndex={-1} autoComplete='off' className='absolute -left-[9999px]' aria-hidden='true' />
			<label className='block'>
				<span className='mb-2 block text-[13px] font-semibold'>The page</span>
				<input name='url' defaultValue={url} required placeholder='https://budget.betterbarmm.com/…' className={field} />
				{title ? <span className='mt-1.5 block text-[12.5px] text-[var(--ink-3)]'>{title}</span> : null}
			</label>
			<label className='block'>
				<span className='mb-2 block text-[13px] font-semibold'>What is wrong, and what should it say?</span>
				<textarea
					name='message'
					rows={6}
					required
					minLength={10}
					maxLength={4000}
					placeholder='For example: the amount for Bill 412 is ₱5,000,000, not ₱50,000,000 — page 3 of the PDF.'
					className={field}
				/>
				<span className='mt-1.5 block text-[12.5px] text-[var(--ink-3)]'>A link to the source, or the page of the document, helps most.</span>
			</label>
			<label className='block'>
				<span className='mb-2 block text-[13px] font-semibold'>
					Your email <span className='font-normal text-[var(--ink-3)]'>(optional, to hear when it is fixed)</span>
				</span>
				<input name='contact' type='email' maxLength={200} className={field} />
			</label>
			{state.error ? (
				<p role='alert' className='text-[14px] text-[var(--accent)]'>
					{state.error}
				</p>
			) : null}
			<button type='submit' disabled={pending} className='bb-btn bb-btn-brass'>
				{pending ? 'Sending…' : 'Send the report'}
			</button>
		</form>
	)
}
