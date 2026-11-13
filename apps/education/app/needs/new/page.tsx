import { notFound } from 'next/navigation'
import { NEEDS_LIVE } from '../../_lib/needs'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../../_components/parts'
import { areaNameOf, schoolById, schools } from '../../_lib/education'
import { NeedForm } from '../need-form'

export const metadata: Metadata = {
	title: 'Post a need',
	description: 'Tell us what your school needs. An editor checks every post before it appears.',
	robots: { index: false, follow: true },
}

const FIELD = 'h-11 min-w-0 flex-1 border border-[var(--rule)] bg-[var(--paper)] px-4 text-[0.9375rem] text-[var(--ink)]'

const fold = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
/** How a school reads in the pick-list: its name and its town. */
const option = (s: { name: string; townName: string }) => `${s.name} · ${s.townName}`

export default async function PostNeedPage({ searchParams }: { searchParams: Promise<{ school?: string; q?: string }> }) {
	if (!NEEDS_LIVE) notFound()
	const { school: id, q } = await searchParams
	const words = fold(q ?? '').split(/\s+/).filter(Boolean)
	const matches = words.length ? schools.filter((s) => words.every((w) => fold(`${s.name} ${s.townName} ${s.id}`).includes(w))).slice(0, 40) : []
	// A school chosen from the list as typed, or the one school the words fit, needs no second step.
	const school = (id ? schoolById.get(id) : undefined) ?? schools.find((s) => option(s) === q?.trim()) ?? (matches.length === 1 ? matches[0] : undefined)

	return (
		<>
			<Masthead kicker='Education · Bangsamoro' name='Post a need' note='Two steps: find the school, then say what it needs. An editor checks every post before it appears on the site.' />

			<section className='bb-container bb-section max-w-[48rem]'>
				{school ? (
					<>
						<div className='flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--rule)] pb-4'>
							<div>
								<p className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>The school</p>
								<p className='mt-1 text-[1.25rem] font-extrabold text-[var(--ink)]'>{school.name}</p>
								<p className='text-[0.84375rem] text-[var(--ink-3)]'>
									{school.townName}, {areaNameOf(school.area)} · ID {school.id}
								</p>
							</div>
							<Link href='/needs/new' className='rule-link text-[0.875rem]'>
								Another school
							</Link>
						</div>
						<div className='mt-8'>
							<NeedForm school={{ id: school.id, name: school.name, townName: school.townName }} />
						</div>
					</>
				) : (
					<>
						<h2 className='text-[1.25rem] font-extrabold text-[var(--ink)]'>1. Find the school</h2>
						<form method='get' className='mt-4 flex gap-2'>
							{/* The browser offers the schools as the reader types; a pick, or a search that fits one school, opens the form at once. */}
							<input name='q' list='schools' defaultValue={q ?? ''} required autoComplete='off' placeholder='Start typing the school’s name or town' className={FIELD} autoFocus />
							<datalist id='schools'>
								{schools.map((s) => (
									<option key={s.id} value={option(s)} />
								))}
							</datalist>
							<button type='submit' className='bb-btn bb-btn-accent h-11'>
								Find
							</button>
						</form>
						{words.length ? (
							matches.length ? (
								<ul className='mt-6 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]'>
									{matches.map((s) => (
										<li key={s.id}>
											<Link href={`/needs/new?school=${s.id}`} className='group flex items-baseline justify-between gap-4 py-3'>
												<span>
													<span className='block font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]'>{s.name}</span>
													<span className='text-[0.8125rem] text-[var(--ink-3)]'>
														{s.townName}, {areaNameOf(s.area)}
													</span>
												</span>
												<span className='num shrink-0 text-[0.78125rem] text-[var(--ink-3)]'>ID {s.id}</span>
											</Link>
										</li>
									))}
								</ul>
							) : (
								<p className='mt-6 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
									No school matches. The list is DepEd&rsquo;s latest: a madrasah outside the public schools or a learning centre may not be on it.
									Email{' '}
									<a href='mailto:support@betterbarmm.com' className='rule-link'>
										support@betterbarmm.com
									</a>{' '}
									with the school&rsquo;s name and town and what it needs, and we will add it.
								</p>
							)
						) : (
							<p className='mt-4 text-[0.875rem] text-[var(--ink-3)]'>Or open the school&rsquo;s own page and choose &ldquo;Post a need&rdquo; there.</p>
						)}
					</>
				)}
			</section>
		</>
	)
}
