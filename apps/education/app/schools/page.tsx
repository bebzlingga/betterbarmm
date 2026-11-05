import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { MANAGEMENT } from '../_lib/school-types'
import { SOURCE_LABEL, TYPES, schoolAreas, schools, type School } from '../_lib/education'

export const metadata: Metadata = {
	title: 'Schools',
	description: 'Every school in the region, public and private, in every town: the public schools on the Department of Education’s 2019 masterlist, and the private schools, madaris, colleges and universities on OpenStreetMap.',
}

const FIELD = 'h-10 border border-[var(--rule)] bg-[var(--paper)] px-3 text-[0.875rem] text-[var(--ink)]'

const fold = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default async function SchoolsPage({ searchParams }: { searchParams: Promise<{ area?: string; type?: string; run?: string; q?: string; district?: string }> }) {
	const { area, type, run, q, district } = await searchParams
	const words = fold(q ?? '').split(/\s+/).filter(Boolean)
	const shown = schools.filter(
		(s) =>
			(!area || s.area === area) &&
			(!type || s.type === type) &&
			(!run || s.management === run) &&
			(!district || s.district?.replace(/, Department of Education$/, '') === district) &&
			words.every((w) => fold(`${s.name} ${s.townName} ${s.id} ${s.district ?? ''}`).includes(w)),
	)
	const towns = new Map<string, School[]>()
	for (const s of shown) towns.set(`${s.area}/${s.town}`, [...(towns.get(`${s.area}/${s.town}`) ?? []), s])
	const areaName = (slug: string) => schoolAreas.find((a) => a.slug === slug)?.name ?? slug

	return (
		<>
			<Masthead
				kicker='Education · Bangsamoro'
				name='Schools'
				note={`${schools.length.toLocaleString('en-PH')} schools in the town each is in: the public schools on the Department of Education’s 2019 masterlist, and the private schools, madaris, colleges and universities mapped on OpenStreetMap.`}
			/>

			<section className='bb-container bb-section'>
				{/* A plain form: the filters are the page's address, so a search can be shared. */}
				<form method='get' className='flex flex-wrap items-end gap-3'>
					<label className='flex flex-col gap-1.5 text-[0.75rem] text-[var(--ink-3)]'>
						Area
						<select name='area' defaultValue={area ?? ''} className={FIELD}>
							<option value=''>All areas</option>
							{schoolAreas
								.filter((a) => a.total)
								.map((a) => (
									<option key={a.slug} value={a.slug}>
										{a.name}
									</option>
								))}
						</select>
					</label>
					<label className='flex flex-col gap-1.5 text-[0.75rem] text-[var(--ink-3)]'>
						Kind
						<select name='type' defaultValue={type ?? ''} className={FIELD}>
							<option value=''>All kinds</option>
							{TYPES.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</label>
					<label className='flex flex-col gap-1.5 text-[0.75rem] text-[var(--ink-3)]'>
						Run by
						<select name='run' defaultValue={run ?? ''} className={FIELD}>
							<option value=''>Public and private</option>
							{MANAGEMENT.map((m) => (
								<option key={m} value={m}>
									{m === 'Not stated' ? 'Not stated' : m}
								</option>
							))}
						</select>
					</label>
					<label className='flex min-w-[14rem] flex-1 flex-col gap-1.5 text-[0.75rem] text-[var(--ink-3)]'>
						Name, town or school ID
						<input name='q' defaultValue={q ?? ''} placeholder='e.g. Bongao, 131823' className={FIELD} />
					</label>
					<button type='submit' className='bb-btn bb-btn-accent h-10'>
						Show
					</button>
					{district ? <input type='hidden' name='district' value={district} /> : null}
					{area || type || run || q || district ? (
						<Link href='/schools' className='rule-link h-10 content-center text-[0.875rem]'>
							Clear
						</Link>
					) : null}
				</form>

				<p className='mt-8 text-[0.875rem] text-[var(--ink-3)]'>
					{shown.length.toLocaleString('en-PH')} {shown.length === 1 ? 'school' : 'schools'} in {towns.size} {towns.size === 1 ? 'town' : 'towns'}
					{district ? (
						<>
							{' '}
							· {district} (
							<Link href='/districts' className='rule-link'>
								every district
							</Link>
							)
						</>
					) : null}
				</p>

				<div className='mt-6 space-y-10'>
					{[...towns.entries()].map(([key, list]) => (
						<section key={key}>
							<h2 className='flex flex-wrap items-baseline gap-x-3 border-b border-[var(--rule)] pb-2'>
								<span className='text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{list[0]!.townName}</span>
								<span className='text-[0.78125rem] text-[var(--ink-3)]'>
									{areaName(list[0]!.area)} · {list.length} {list.length === 1 ? 'school' : 'schools'}
								</span>
							</h2>
							<ul className='divide-y divide-[var(--rule-soft)]'>
								{list.map((s) => (
									<li key={s.id} className='grid gap-x-6 gap-y-0.5 py-2.5 text-[0.84375rem] sm:grid-cols-[minmax(0,1fr)_9rem_6.5rem]'>
										<span>
											<Link href={`/schools/${s.id}`} className='rule-link font-semibold text-[var(--ink)]'>
												{s.name}
											</Link>
											{s.district ? <span className='block text-[0.75rem] text-[var(--ink-3)]'>{s.district.replace(/, Department of Education$/, '')}</span> : null}
											{/* On a phone the level and the ID share a line under the name. */}
											<span className='mt-0.5 block text-[0.75rem] text-[var(--ink-2)] sm:hidden'>
												{s.level}
												{s.management !== 'Public' ? ` · ${s.management === 'Private' ? 'Private' : 'Run by: not stated'}` : ''}
												{s.source === 'deped' ? ` · ID ${s.id}` : ''}
											</span>
										</span>
										<span className='hidden text-[var(--ink-2)] sm:block'>
											{s.level}
											{s.management !== 'Public' ? <span className='block text-[0.75rem] text-[var(--ink-3)]'>{s.management === 'Private' ? 'Private' : 'Run by: not stated'}</span> : null}
										</span>
										<span className='num hidden text-right text-[var(--ink-3)] sm:block'>{s.source === 'deped' ? `ID ${s.id}` : SOURCE_LABEL[s.source]}</span>
									</li>
								))}
							</ul>
						</section>
					))}
				</div>
			</section>
		</>
	)
}
