'use client'

import { NEED_KINDS, NEED_POSTERS } from '@betterbarmm/db/needs'
import { CheckCircleIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { postNeed, type NeedState } from './actions'

const field = 'w-full border border-[var(--rule)] bg-[var(--paper)] px-4 py-3 text-[0.9375rem] outline-none focus:border-[var(--accent)]'
const label = 'mb-2 block text-[0.8125rem] font-semibold text-[var(--ink)]'
const hint = 'mt-1.5 block text-[0.78125rem] leading-5 text-[var(--ink-3)]'
const CHIP = 'cursor-pointer border border-[var(--rule)] px-3 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition hover:border-[var(--ink)] aria-pressed:border-[var(--ink)] aria-pressed:bg-[var(--ink)] aria-pressed:text-[var(--paper)]'

/** The needs schools post most: one tap fills in the kind and the title, and only the details are left to write. */
const COMMON: { kind: string; title: string }[] = [
	{ kind: 'seats', title: 'Learners have no chairs or desks' },
	{ kind: 'classrooms', title: 'Not enough classrooms' },
	{ kind: 'repairs', title: 'A classroom needs repair' },
	{ kind: 'teachers', title: 'Not enough teachers' },
	{ kind: 'water', title: 'The school has no water' },
	{ kind: 'electricity', title: 'The school has no electricity' },
	{ kind: 'toilets', title: 'Not enough toilets' },
	{ kind: 'books', title: 'No books or learning materials' },
	{ kind: 'internet', title: 'No internet or devices' },
	{ kind: 'supplies', title: 'Learners lack school supplies' },
]

export function NeedForm({ school }: { school: { id: string; name: string; townName: string } }) {
	const [state, action, pending] = useActionState<NeedState, FormData>(postNeed, { ok: false, error: null })
	const [started] = useState(() => Date.now())
	const [kind, setKind] = useState('')
	const [title, setTitle] = useState('')
	const chosen = COMMON.find((c) => c.kind === kind && c.title === title)

	if (state.ok)
		return (
			<div className='flex items-start gap-3 bg-[var(--paper-2)] p-6'>
				<CheckCircleIcon size={22} weight='fill' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
				<div>
					<p className='text-[1.0625rem] font-extrabold text-[var(--ink)]'>Thank you. It is with our editors now.</p>
					<p className='mt-2 text-[0.90625rem] leading-7 text-[var(--ink-2)]'>
						Once it is checked it goes on {school.name}&rsquo;s page and the needs board, so that the ministry, the town, donors and
						volunteers can see it. Your contact detail is never shown.
					</p>
					<Link href={`/schools/${school.id}`} className='rule-link mt-4 inline-block text-[0.875rem] font-semibold'>
						Back to the school
					</Link>
				</div>
			</div>
		)

	return (
		<form action={action} className='space-y-6'>
			<input type='hidden' name='started' value={started} />
			<input type='hidden' name='school' value={school.id} />
			{/* Hidden from people; a bot fills it in. */}
			<input type='text' name='website' tabIndex={-1} autoComplete='off' className='absolute -left-[9999px]' aria-hidden='true' />

			<div>
				<span className={label}>What does the school need most? Tap one, or choose below.</span>
				<div className='flex flex-wrap gap-2'>
					{COMMON.map((c) => (
						<button
							key={c.kind}
							type='button'
							aria-pressed={chosen === c}
							onClick={() => {
								setKind(c.kind)
								setTitle(c.title)
							}}
							className={CHIP}
						>
							{c.title}
						</button>
					))}
				</div>
			</div>

			<div className='grid gap-6 sm:grid-cols-2'>
				<label className='block'>
					<span className={label}>What does the school need?</span>
					<select name='kind' required value={kind} onChange={(e) => setKind(e.target.value)} className={field}>
						<option value='' disabled>
							Choose one
						</option>
						{NEED_KINDS.map((k) => (
							<option key={k.value} value={k.value}>
								{k.label}
							</option>
						))}
					</select>
				</label>
				<label className='block'>
					<span className={label}>Who are you?</span>
					<select name='poster' required defaultValue='' className={field}>
						<option value='' disabled>
							Choose one
						</option>
						{NEED_POSTERS.map((p) => (
							<option key={p.value} value={p.value}>
								{p.label}
							</option>
						))}
					</select>
				</label>
			</div>

			<label className='block'>
				<span className={label}>What is missing, and how does it affect the learners?</span>
				<textarea
					name='details'
					rows={6}
					required
					minLength={20}
					maxLength={2000}
					placeholder='For example: two of our six classrooms were damaged in the flood in July. Since then 70 learners share one room in shifts.'
					className={field}
				/>
				<span className={hint}>Please do not name or describe any child. Say how many learners it affects instead.</span>
			</label>

			<label className='block'>
				<span className={label}>
					A short title <span className='font-normal text-[var(--ink-3)]'>(optional: the first line of your details stands in)</span>
				</span>
				<input name='title' maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder='For example: Grade 3 learners have no chairs' className={field} />
			</label>

			<label className='block sm:max-w-[16rem]'>
				<span className={label}>
					How many? <span className='font-normal text-[var(--ink-3)]'>(optional)</span>
				</span>
				<input name='quantity' type='number' min={1} max={100000} inputMode='numeric' placeholder='e.g. 2 classrooms, 70 chairs' className={field} />
			</label>

			<label className='block'>
				<span className={label}>
					How can we reach you? <span className='font-normal text-[var(--ink-3)]'>(optional, never shown)</span>
				</span>
				<input name='contact' maxLength={200} placeholder='Email or mobile number' className={field} />
				<span className={hint}>Only our editors see it, to check the post or put you in touch with someone who can help.</span>
			</label>

			{state.error ? (
				<p role='alert' className='text-[0.875rem] text-[var(--accent)]'>
					{state.error}
				</p>
			) : null}
			<button type='submit' disabled={pending} className='bb-btn bb-btn-accent'>
				{pending ? 'Sending…' : 'Post the need'}
			</button>
		</form>
	)
}
