'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useState } from 'react'

/* Every town and city by province, narrowed as the reader types. */

export type FinderArea = { slug: string; name: string; units: { slug: string; name: string }[] }

const fold = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function AreaFinder({ areas }: { areas: FinderArea[] }) {
	const [q, setQ] = useState('')
	const words = fold(q).split(/\s+/).filter(Boolean)
	const shown = areas
		.map((a) => ({ ...a, units: a.units.filter((u) => words.every((w) => fold(`${u.name} ${a.name}`).includes(w))) }))
		.filter((a) => a.units.length)

	return (
		<div>
			<label className='flex max-w-[30rem] items-center gap-3 border border-[var(--rule)] bg-[var(--paper)] px-4 py-3'>
				<MagnifyingGlassIcon size={18} className='text-[var(--ink-3)]' aria-hidden='true' />
				<input
					type='search'
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder='Your town or city'
					aria-label='Find your town or city'
					className='w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--ink-mute)]'
					autoFocus
				/>
			</label>
			<div className='mt-12 grid gap-x-16 gap-y-12 sm:grid-cols-2 lg:grid-cols-3'>
				{shown.map((a) => (
					<section key={a.slug}>
						<h2 className='border-b border-[var(--rule)] pb-2 text-[1.1rem] font-extrabold tracking-[-0.02em]'>{a.name}</h2>
						<ul className='mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[14px]'>
							{a.units.map((u) => (
								<li key={u.slug}>
									<Link href={`/my-area/${a.slug}/${u.slug}`} className='text-[var(--ink-2)] hover:text-[var(--accent)]'>
										{u.name}
									</Link>
								</li>
							))}
						</ul>
					</section>
				))}
				{!shown.length ? <p className='text-[14px] text-[var(--ink-3)]'>No town or city by that name.</p> : null}
			</div>
		</div>
	)
}
