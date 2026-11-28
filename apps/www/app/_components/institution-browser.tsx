'use client'

import { ArrowRightIcon, ArrowUpRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Emblem } from './emblem'

/** One institution, prepared on the server from the chapter's card and its directory entry. */
export type Institution = {
	title: string
	acronym: string | null
	description: string
	kind: 'ministry' | 'office'
	logo: { src: string } | null
	head: { title: string; name: string; photo: { src: string } | null } | null
	directoryHref: string | null
	href: string | null
	hrefLabel: string
}

const KINDS = [
	{ key: 'all', label: 'All' },
	{ key: 'ministry', label: 'Ministries' },
	{ key: 'office', label: 'Commissions, authorities and offices' },
] as const

/**
 * The ministries and the offices beside them as cards, with a filter by kind and a search by name or acronym.
 * Each card: logo and acronym, what it is for, who heads it now (with their portrait where one has been found),
 * and the ways to it — its directory page for contacts, and its own website.
 */
export function InstitutionBrowser({ items }: { items: Institution[] }) {
	const [kind, setKind] = useState<(typeof KINDS)[number]['key']>('all')
	const [q, setQ] = useState('')

	const shown = useMemo(() => {
		const needle = q.trim().toLowerCase()
		return items.filter(
			(i) =>
				(kind === 'all' || i.kind === kind) &&
				(!needle || i.title.toLowerCase().includes(needle) || i.acronym?.toLowerCase().includes(needle) || i.description.toLowerCase().includes(needle)),
		)
	}, [items, kind, q])

	const count = (k: (typeof KINDS)[number]['key']) => (k === 'all' ? items.length : items.filter((i) => i.kind === k).length)

	return (
		<div>
			<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
				<div role='tablist' aria-label='Kind of institution' className='seg'>
					{KINDS.map((k) => {
						const on = kind === k.key
						return (
							<button
								key={k.key}
								type='button'
								role='tab'
								aria-selected={on}
								onClick={() => setKind(k.key)}
								className='seg-tab'
							>
								{k.label}
								<span className='seg-count'>{count(k.key)}</span>
							</button>
						)
					})}
				</div>
				<label className='flex h-12 w-full items-center gap-2.5 rounded-full border border-[var(--rule)] bg-[var(--paper)] px-5 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.45)] transition focus-within:border-[color-mix(in_srgb,var(--ink)_45%,var(--rule))] lg:w-80'>
					<MagnifyingGlassIcon size={16} className='shrink-0 text-[var(--ink-mute)]' aria-hidden='true' />
					<span className='sr-only'>Find an office</span>
					<input
						type='search'
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder='Find an office: health, MILG, youth…'
						className='min-w-0 flex-1 bg-transparent text-[0.875rem] outline-none placeholder:text-[var(--ink-mute)]'
					/>
				</label>
			</div>

			{shown.length ? (
				<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{shown.map((i) => (
						<li key={i.title} className='flex flex-col rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'>
							<div className='flex items-start justify-between gap-4'>
								<Emblem image={i.logo} name={i.title} label={i.acronym} className='size-14 text-[0.625rem]' />
								<span className='flex flex-col items-end gap-1.5'>
									{i.acronym ? (
										<span className='rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2.5 py-1 font-[family-name:var(--font-display)] text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]'>{i.acronym}</span>
									) : null}
									<span className='font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
										{i.kind === 'ministry' ? 'Ministry' : 'Office'}
									</span>
								</span>
							</div>

							<h4 className='mt-5 font-[family-name:var(--font-display)] text-[1.125rem] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{i.title}</h4>
							<p className='mt-2 line-clamp-3 flex-1 text-[0.84375rem] leading-[1.6] text-[var(--ink-2)]'>{i.description}</p>

							<div className='mt-5 flex min-h-[3.5rem] items-center gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--paper-2)_60%,var(--paper))] px-3.5 py-2.5'>
								{i.head ? (
									<>
										<Emblem image={i.head.photo} name={i.head.name} portrait className='size-9 shrink-0 rounded-full text-[0.625rem]' />
										<span className='min-w-0'>
											<span className='block text-[0.6875rem] text-[var(--ink-3)]'>{i.head.title}</span>
											<span className='block truncate text-[0.84375rem] font-semibold text-[var(--ink)]'>{i.head.name}</span>
										</span>
									</>
								) : (
									<span className='text-[0.8125rem] text-[var(--ink-3)]'>Head not named in an official source</span>
								)}
							</div>

							<div className='mt-5 flex items-center justify-between gap-4 text-[0.8125rem] font-semibold'>
								{/* The office's own site on the left, the way into the Directory on the right (user decision). */}
								{i.href ? (
									<a href={i.href} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 text-[var(--ink-3)] transition hover:text-[var(--accent)]'>
										{i.hrefLabel}
										<ArrowUpRightIcon className='size-3' weight='bold' aria-hidden='true' />
									</a>
								) : (
									<span />
								)}
								{i.directoryHref ? (
									<Link href={i.directoryHref} className='inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 py-2 text-[var(--paper)] transition hover:bg-[var(--accent)]'>
										Directory <ArrowRightIcon className='size-3' weight='bold' aria-hidden='true' />
									</Link>
								) : null}
							</div>
						</li>
					))}
				</ul>
			) : (
				<p className='mt-8 text-[0.875rem] text-[var(--ink-3)]'>No office matches “{q}”.</p>
			)}
		</div>
	)
}
