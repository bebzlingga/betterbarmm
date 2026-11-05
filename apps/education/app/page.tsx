import { listSchoolNeeds } from '@betterbarmm/db'
import { ArrowRightIcon, MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { NeedCard } from './_components/need-card'
import { Figures, Masthead, peso } from './_components/parts'
import { SchoolExplorer } from './_components/school-explorer'
import { TYPES, areaNameOf, countBy, largestSchools, latest, latestYear, mapSchools, pupilsTotal, schoolAreas, schools, townLoads } from './_lib/education'

// Newly approved needs show within a minute.
export const revalidate = 60

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const NOTE = 'max-w-[38rem] text-[0.875rem] leading-6 text-[var(--ink-3)] lg:text-right'
const TH = 'px-3 py-2.5 text-left font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
const TD = 'px-3 py-2.5 align-top'

export default async function EducationHome() {
	const needs = await listSchoolNeeds({ limit: 6 })
	const towns = new Set(schools.map((s) => s.town)).size

	return (
		<>
			<Masthead
				kicker='Education · Bangsamoro'
				name='Schools of the Bangsamoro'
				note='Every school in the region, public and private, from the village elementary school to the university: where it is, how big it is, and what its teachers, students and parents say it needs.'
			>
				{/* Fixed colours: inside the brand band, --paper and --ink point at its crimson ground. */}
				<form method='get' action='/schools' className='mt-10 flex h-14 max-w-[44rem] items-center bg-white pl-5 text-[#191713] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]'>
					<MagnifyingGlassIcon size={20} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
					<label htmlFor='school-search' className='sr-only'>
						Find a school
					</label>
					<input
						id='school-search'
						name='q'
						type='search'
						autoComplete='off'
						placeholder='Find a school by name, town or school ID'
						className='ml-3 h-full min-w-0 flex-1 bg-transparent text-[1rem] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
					/>
					<button type='submit' className='h-full shrink-0 cursor-pointer bg-[#191713] px-6 font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#3a3530]'>
						Find
					</button>
				</form>
				<div className='mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.875rem]'>
					<Link href='/map' className='rule-link'>
						See them on a map
					</Link>
					<Link href='/needs/new' className='rule-link'>
						Post what your school needs
					</Link>
				</div>
			</Masthead>

			<Figures
				title='The schools'
				note='The public schools on the Department of Education’s 2019 masterlist, and the private schools, madaris, colleges and universities mapped on OpenStreetMap.'
				items={[
					{ value: schools.length.toLocaleString('en-PH'), label: `Schools, in ${towns} towns and cities` },
					{ value: countBy('management', 'Private').toLocaleString('en-PH'), label: 'Private schools found so far' },
					{ value: countBy('type', 'College or university').toLocaleString('en-PH'), label: 'Colleges and universities' },
					{ value: pupilsTotal.toLocaleString('en-PH'), label: 'Pupils in public schools, 2015–16' },
				]}
			/>

			{/* ---- The map ---- */}
			<section className='bb-container bb-section'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
					<h2 className={H2}>Where they are</h2>
					<p className={NOTE}>
						Each dot a school, coloured by its kind. Open the map to filter by kind, by who runs it and by area, and choose a school to
						see its details.
					</p>
				</div>
				<div className='mt-8'>
					<SchoolExplorer schools={mapSchools} areas={schoolAreas.filter((a) => a.total).map((a) => ({ slug: a.slug, name: a.name }))} />
				</div>
			</section>

			{/* ---- What schools need ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
						<div>
							<h2 className={H2}>What schools need</h2>
							<p className='mt-2 max-w-[40rem] text-[0.875rem] leading-6 text-[var(--ink-3)]'>
								Classrooms, chairs, books, teachers, water: posted by the people who know each school best, and checked by our editors.
							</p>
						</div>
						<Link href='/needs/new' className='bb-btn bb-btn-accent shrink-0'>
							<PlusIcon size={14} weight='bold' aria-hidden='true' />
							Post a need
						</Link>
					</div>
					{needs.length ? (
						<>
							<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
								{needs.map((n) => (
									<li key={n.id}>
										<NeedCard need={n} />
									</li>
								))}
							</ul>
							<Link href='/needs' className='rule-link mt-6 inline-block text-[0.875rem]'>
								Every need
							</Link>
						</>
					) : (
						<p className='mt-8 max-w-[44rem] text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
							Nothing posted yet. If you teach, study or have a child at a school in the region and it is short of something its
							learners need, be the first to say so.
						</p>
					)}
				</div>
			</section>

			{/* ---- Size and load ---- */}
			<section className='bb-container bb-section'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
					<h2 className={H2}>The biggest schools, the busiest towns</h2>
					<p className={NOTE}>
						Pupils in school year 2015–16, the latest the list records. Classrooms and teachers are not published school by school, so
						pupils per school is the nearest measure of load there is.
					</p>
				</div>
				<div className='mt-10 grid gap-12 lg:grid-cols-2'>
					<div>
						<h3 className='border-b border-[var(--rule)] pb-2 text-[1rem] font-bold text-[var(--ink)]'>Most pupils</h3>
						<ol className='divide-y divide-[var(--rule-soft)]'>
							{largestSchools.slice(0, 8).map((s, i) => (
								<li key={s.id} className='grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-3 py-2.5 text-[0.875rem]'>
									<span className='num text-[var(--ink-3)]'>{i + 1}</span>
									<span>
										<Link href={`/schools/${s.id}`} className='rule-link font-semibold'>
											{s.name}
										</Link>
										<span className='block text-[0.75rem] text-[var(--ink-3)]'>
											{s.townName}, {areaNameOf(s.area)}
										</span>
									</span>
									<span className='num font-semibold text-[var(--ink)]'>{s.pupils2015!.toLocaleString('en-PH')}</span>
								</li>
							))}
						</ol>
					</div>
					<div>
						<h3 className='border-b border-[var(--rule)] pb-2 text-[1rem] font-bold text-[var(--ink)]'>Most pupils per school, by town</h3>
						<ol className='divide-y divide-[var(--rule-soft)]'>
							{townLoads
								.filter((t) => t.counted >= 3)
								.slice(0, 8)
								.map((t, i) => (
									<li key={t.town} className='grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-3 py-2.5 text-[0.875rem]'>
										<span className='num text-[var(--ink-3)]'>{i + 1}</span>
										<span>
											<Link href={`/schools?q=${encodeURIComponent(t.townName)}&area=${t.area}`} className='rule-link font-semibold'>
												{t.townName}
											</Link>
											<span className='block text-[0.75rem] text-[var(--ink-3)]'>
												{areaNameOf(t.area)} · {t.schools} schools, {t.pupils.toLocaleString('en-PH')} pupils
											</span>
										</span>
										<span className='num font-semibold text-[var(--ink)]'>{t.perSchool.toLocaleString('en-PH')}</span>
									</li>
								))}
						</ol>
					</div>
				</div>
			</section>

			{/* ---- By area ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
						<h2 className={H2}>By area</h2>
						<p className={NOTE}>Cotabato City&rsquo;s and the Special Geographic Area&rsquo;s public schools, which DepEd&rsquo;s 2019 list filed under Region XII, are counted with the city and with the SGA town their barangay is now in.</p>
					</div>
					<div className='mt-8 overflow-x-auto border border-[var(--rule)] bg-[var(--paper)]'>
						<table className='w-full min-w-[52rem] text-[0.875rem]'>
							<thead className='border-b border-[var(--rule)]'>
								<tr>
									<th className={TH}>Area</th>
									{TYPES.map((t) => (
										<th key={t} className={`${TH} !text-right`}>{t}</th>
									))}
									<th className={`${TH} !text-right`}>All</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-[var(--rule-soft)]'>
								{schoolAreas.map((a) => (
									<tr key={a.slug}>
										<td className={TD}>
											{a.total ? (
												<Link href={`/schools?area=${a.slug}`} className='rule-link font-semibold'>
													{a.name}
												</Link>
											) : (
												<span className='font-semibold text-[var(--ink-3)]'>{a.name}</span>
											)}
										</td>
										{TYPES.map((t) => (
											<td key={t} className={`${TD} num text-right`}>{a.byType[t] ? a.byType[t]!.toLocaleString('en-PH') : '–'}</td>
										))}
										<td className={`${TD} num text-right font-semibold`}>{a.total ? a.total.toLocaleString('en-PH') : '–'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* ---- The budget, in one line ---- */}
			<section className='bb-container py-14'>
				<Link href='/budget' className='group flex flex-col gap-2 border border-[var(--rule)] p-6 transition hover:border-[var(--ink)] sm:flex-row sm:items-center sm:justify-between'>
					<span>
						<span className='block font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>Budget</span>
						<span className='mt-1 block text-[1.0625rem] font-bold text-[var(--ink)]'>
							The education ministry was given {peso(latest.totals.total)} for FY {latestYear}. See where it goes.
						</span>
					</span>
					<ArrowRightIcon size={18} weight='bold' className='shrink-0 text-[var(--ink-3)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]' aria-hidden='true' />
				</Link>
			</section>
		</>
	)
}
