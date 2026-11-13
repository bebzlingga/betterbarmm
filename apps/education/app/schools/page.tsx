import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { MANAGEMENT } from '../_lib/school-types'
import { SOURCE_LABEL, TYPES, districtLabel, latestSY, schoolAreas, schools, townIndex, type School } from '../_lib/education'

export const metadata: Metadata = {
	title: 'Schools',
	description: 'Every school in the region, public and private, in every town: every school on the Department of Education’s list, with its learners, and the madaris and colleges OpenStreetMap and Wikipedia add.',
}

const FIELD = 'h-10 border border-[var(--rule)] bg-[var(--paper)] px-3 text-[0.875rem] text-[var(--ink)]'

const fold = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default async function SchoolsPage({ searchParams }: { searchParams: Promise<{ area?: string; type?: string; run?: string; q?: string; district?: string; town?: string }> }) {
	const { area, type, run, q, district, town } = await searchParams
	const words = fold(q ?? '').split(/\s+/).filter(Boolean)
	const shown = schools.filter(
		(s) =>
			(!area || s.area === area) &&
			(!type || s.type === type) &&
			(!run || s.management === run) &&
			(!district || districtLabel(s) === district) &&
			(!town || s.town === town) &&
			words.every((w) => fold(`${s.name} ${s.townName} ${s.id} ${districtLabel(s) ?? ''}`).includes(w)),
	)
	const towns = new Map<string, School[]>()
	for (const s of shown) towns.set(`${s.area}/${s.town}`, [...(towns.get(`${s.area}/${s.town}`) ?? []), s])
	const areaName = (slug: string) => schoolAreas.find((a) => a.slug === slug)?.name ?? slug
	/* Until a reader names a school, a town or a district, the page is the region's towns, each with its count:
	   2,294 schools in one column is a list nobody reads. The kind and area filters narrow the counts. */
	const browsing = !words.length && !town && !district
	const keep = (next: Record<string, string | undefined>) => {
		const params = new URLSearchParams(Object.entries({ type, run, ...next }).filter((e): e is [string, string] => Boolean(e[1])))
		return `/schools${params.size ? `?${params}` : ''}`
	}

	return (
		<>
			<Masthead
				kicker='Education · Bangsamoro'
				name='Schools'
				note={`${schools.length.toLocaleString('en-PH')} schools: every school on the Department of Education’s list for school year ${latestSY}, public and private, and the madaris and colleges OpenStreetMap and Wikipedia add. Choose a town to see its schools, or search by name or school ID.`}
			/>

			<section className='bb-container bb-section'>
				{/* A plain form: the filters are the page's address, so a search can be shared. */}
				<form method='get' className='flex flex-wrap items-end gap-3 max-sm:[&>button]:w-full max-sm:[&>label]:w-full max-sm:[&_select]:w-full'>
					{/* The name search on the left; the filters, Show and Clear pushed to the right. */}
					<label className='flex w-full flex-col gap-1.5 text-[0.75rem] text-[var(--ink-3)] sm:w-80'>
						Name, town or school ID
						<input name='q' defaultValue={q ?? ''} placeholder='e.g. Bongao, 131823' className={FIELD} />
					</label>
					<label className='flex flex-col gap-1.5 text-[0.75rem] text-[var(--ink-3)] lg:ml-auto'>
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
					<button type='submit' className='bb-btn bb-btn-accent h-10'>
						Show
					</button>
					{district ? <input type='hidden' name='district' value={district} /> : null}
					{town ? <input type='hidden' name='town' value={town} /> : null}
				</form>

				{/* No running count (user decision); only the district, when the list is one. */}
				{district ? (
					<p className='mt-8 text-[0.875rem] text-[var(--ink-3)]'>
						{district} (
						<Link href='/districts' className='rule-link'>
							every district
						</Link>
						)
					</p>
				) : null}

				{browsing ? (
					<div className='mt-12 space-y-12'>
						{townIndex(shown).map((a) => (
							<section key={a.slug}>
								<h2 className='mb-2 flex flex-wrap items-baseline gap-x-3 border-b border-[var(--rule)] pb-4'>
									<span className='text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{a.name}</span>
									<span className='text-[0.78125rem] text-[var(--ink-3)]'>
										{a.total.toLocaleString('en-PH')} {a.total === 1 ? 'school' : 'schools'} in {a.towns.length} {a.towns.length === 1 ? 'town' : 'towns'}
									</span>
								</h2>
								<ul className='grid gap-x-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-16'>
									{a.towns.map((t) => (
										<li key={t.town} className='border-b border-[var(--rule-soft)]'>
											<Link href={keep({ town: t.town })} className='group flex items-baseline justify-between gap-4 py-2.5 text-[0.875rem]'>
												<span className='font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]'>{t.townName}</span>
												<span className='num text-[var(--ink-3)]'>{t.count.toLocaleString('en-PH')}</span>
											</Link>
										</li>
									))}
								</ul>
							</section>
						))}
					</div>
				) : (
					<div className='mt-12 space-y-10'>
					{[...towns.entries()].map(([key, list]) => (
						<section key={key}>
							<h2 className='mb-2 flex flex-wrap items-baseline gap-x-3 border-b border-[var(--rule)] pb-4'>
								<span className='text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{list[0]!.townName}</span>
								<span className='text-[0.78125rem] text-[var(--ink-3)]'>
									{areaName(list[0]!.area)} · {list.length} {list.length === 1 ? 'school' : 'schools'}
								</span>
							</h2>
							<ul className='divide-y divide-[var(--rule-soft)]'>
								{list.map((s) => (
									<li key={s.id} className='grid items-center gap-x-6 gap-y-0.5 py-3 text-[0.84375rem] sm:grid-cols-[minmax(0,1fr)_9rem_6.5rem] lg:grid-cols-[minmax(0,52rem)_14rem_minmax(0,1fr)]'>
										<span>
											<Link href={`/schools/${s.id}`} className='rule-link font-semibold text-[var(--ink)]'>
												{s.name}
											</Link>
											{s.district ? <span className='mt-1.5 block text-[0.75rem] text-[var(--ink-3)]'>{districtLabel(s)}</span> : null}
											{/* On a phone the level and the ID share a line under the name. */}
											<span className='mt-1 block text-[0.75rem] text-[var(--ink-2)] sm:hidden'>
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
				)}
			</section>
		</>
	)
}
