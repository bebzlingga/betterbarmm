import type { Metadata } from 'next'
import { MapPinAreaIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { MANAGEMENT } from '../_lib/school-types'
import { SOURCE_LABEL, TYPES, districtLabel, latestSY, schoolAreas, schools, townIndex, type School } from '../_lib/education'

export const metadata: Metadata = {
	title: 'Schools',
	description: 'Every school in the region, public and private, in every town: every school on the Department of Education’s list, with its learners, and the madaris and colleges OpenStreetMap and Wikipedia add.',
}

/** A field as a pill (user decision: the travel look). */
const FIELD = 'h-12 rounded-full border border-[var(--rule)] bg-[var(--paper)] px-5 font-[family-name:var(--font-body)] text-[0.9375rem] font-normal normal-case tracking-normal text-[var(--ink)] shadow-[0_10px_24px_-20px_rgba(0,0,0,0.45)] outline-none focus:border-[var(--ink)]'
/** A total of the figures there are, skipping the ones a school does not have. */
const sum = (xs: (number | null | undefined)[]) => xs.reduce<number>((n, x) => n + (x ?? 0), 0)

const LABEL = 'flex flex-col gap-1.5 pl-1 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const CARD = 'rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] sm:p-8'

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

			<section className='bb-container dv-section'>
				{/* A plain form: the filters are the page's address, so a search can be shared. */}
				<form method='get' className='flex flex-wrap items-end gap-4 max-sm:[&>button]:w-full max-sm:[&>label]:w-full max-sm:[&_select]:w-full'>
					{/* The name search on the left; the filters, Show and Clear pushed to the right. */}
					<label className={`${LABEL} w-full sm:w-80`}>
						Name, municipality or school ID
						<input name='q' defaultValue={q ?? ''} placeholder='e.g. Bongao, 131823' className={FIELD} />
					</label>
					<label className={`${LABEL} lg:ml-auto`}>
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
					<label className={LABEL}>
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
					<label className={LABEL}>
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
					<button type='submit' className='dv-btn dv-btn-accent h-12 justify-center'>
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
						{townIndex(shown).map((a) => {
							// Each municipality of the area as a row (user decision: a table, so more can be added): its schools, public
							// and private, its learners, its public schools' teachers and learners per teacher there.
							const rows = a.towns.map((t) => {
								const list = shown.filter((s) => s.area === a.slug && s.town === t.town)
								const pub = list.filter((s) => s.management === 'Public')
								const teachers = sum(pub.map((s) => s.teachers))
								const pubLearners = sum(pub.filter((s) => s.teachers).map((s) => s.enrolment['2023-24']))
								return { ...t, pub: pub.length, priv: list.length - pub.length, learners: sum(list.map((s) => s.pupils)), teachers, ratio: teachers ? pubLearners / teachers : null }
							})
							return (
								<section key={a.slug}>
									<h2 className='mb-5 flex flex-wrap items-center gap-x-3 gap-y-2'>
										<span className='grid size-10 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
											<MapPinAreaIcon size={20} weight='duotone' aria-hidden='true' />
										</span>
										<span className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{a.name}</span>
										<span className='rounded-full bg-[var(--paper-2)] px-3 py-1 text-[0.75rem] text-[var(--ink-3)]'>
											{a.total.toLocaleString('en-PH')} {a.total === 1 ? 'school' : 'schools'} in {a.towns.length} {a.towns.length === 1 ? 'municipality' : 'municipalities'}
										</span>
									</h2>
									<div className='overflow-x-auto rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] shadow-[0_18px_40px_-34px_rgba(0,0,0,0.4)]'>
										<table className='w-full min-w-[46rem] border-collapse text-left'>
											<thead>
												<tr className='border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))]'>
													<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] pl-6'>Municipality</th>
													<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>Schools</th>
													<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>Public</th>
													<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>Private</th>
													<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>Learners, {latestSY}</th>
													<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>Teachers, 2023–24</th>
													<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>Learners per teacher</th>
												</tr>
											</thead>
											<tbody>
												{rows.map((t) => (
													<tr key={t.town} className='border-b border-[var(--rule-soft)] align-middle transition-colors last:border-b-0 hover:bg-[var(--paper-2)]'>
														<th scope='row' className='py-3.5 pl-6 pr-6 font-normal'>
															<Link href={keep({ town: t.town })} className='rule-link text-[0.9375rem] font-semibold text-[var(--ink)]'>
																{t.townName}
															</Link>
														</th>
														<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)] font-bold !text-[var(--ink)]'>{t.count.toLocaleString('en-PH')}</td>
														<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)]'>{t.pub.toLocaleString('en-PH')}</td>
														<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)]'>{t.priv.toLocaleString('en-PH')}</td>
														<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)]'>{t.learners ? t.learners.toLocaleString('en-PH') : '—'}</td>
														<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)]'>{t.teachers ? t.teachers.toLocaleString('en-PH') : '—'}</td>
														<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)]'>{t.ratio ? Math.round(t.ratio).toLocaleString('en-PH') : '—'}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</section>
							)
						})}
						<p className='text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
							Learners are DepEd&rsquo;s for school year {latestSY}. Teachers are the classroom posts in DepEd&rsquo;s personnel file for 2023–24,
							which covers public schools only; learners per teacher compares them with the same schools&rsquo; learners that year.
						</p>
					</div>
				) : (
					<div className='mt-12 space-y-12'>
						{[...towns.entries()].map(([key, list]) => (
							<section key={key}>
								<h2 className='mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1'>
									<span className='font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{list[0]!.townName}</span>
									<span className='text-[0.8125rem] text-[var(--ink-3)]'>
										{areaName(list[0]!.area)} · {list.length} {list.length === 1 ? 'school' : 'schools'}
									</span>
								</h2>
								{/* Each school as a row (user decision: a table): what it teaches, who runs it, its learners, and where DepEd
								    files them, its teachers and classrooms. */}
								<div className='overflow-x-auto rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] shadow-[0_18px_40px_-34px_rgba(0,0,0,0.4)]'>
									<table className='w-full min-w-[56rem] border-collapse text-left'>
										<thead>
											<tr className='border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))]'>
												<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] pl-6'>School</th>
												<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Level</th>
												<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>Learners, {latestSY}</th>
												<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>Teachers</th>
												<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>Classrooms</th>
												<th scope='col' className='py-4 pr-6 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] text-right'>ID</th>
											</tr>
										</thead>
										<tbody>
											{list.map((s) => (
												<tr key={s.id} className='border-b border-[var(--rule-soft)] align-middle transition-colors last:border-b-0 hover:bg-[var(--paper-2)]'>
													<th scope='row' className='py-3.5 pl-6 pr-6 font-normal'>
														<Link href={`/schools/${s.id}`} className='rule-link text-[0.9375rem] font-semibold text-[var(--ink)]'>
															{s.name}
														</Link>
														{s.district ? <span className='mt-1 block text-[0.8125rem] text-[var(--ink-3)]'>{districtLabel(s)}</span> : null}
													</th>
													<td className='py-3.5 pr-6 text-[0.875rem] text-[var(--ink-2)]'>
														{s.level}
														<span className='block text-[0.8125rem] text-[var(--ink-3)]'>{s.management === 'Public' ? 'Public' : s.management === 'Private' ? 'Private' : 'Run by: not stated'}</span>
													</td>
													<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)] font-bold !text-[var(--ink)]'>{s.pupils ? s.pupils.toLocaleString('en-PH') : '—'}</td>
													<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)]'>{s.teachers ? s.teachers.toLocaleString('en-PH') : '—'}</td>
													<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)]'>{s.classrooms ? s.classrooms.toLocaleString('en-PH') : '—'}</td>
													<td className='num whitespace-nowrap py-3.5 pr-6 text-right text-[0.9375rem] text-[var(--ink-2)] !text-[0.8125rem] !text-[var(--ink-3)]'>{s.source === 'deped' ? s.id : SOURCE_LABEL[s.source]}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</section>
						))}
						<p className='text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
							Learners are DepEd&rsquo;s for school year {latestSY}; teachers and classrooms are DepEd&rsquo;s for 2023–24, filed for public schools only.
						</p>
					</div>
				)}
			</section>
		</>
	)
}
