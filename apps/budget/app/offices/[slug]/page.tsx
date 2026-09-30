import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { SectionHead, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { budgetFor, percent, peso, type Office } from '@betterbarmm/budget-data'
import { YearLink } from '../../_components/year-link'
import { notFound } from 'next/navigation'
import { ExpenseSplit, Masthead, SourceNote, StatRow } from '../../_components/budget-parts'
import { ObjectTree, ProgramTree } from '../../_components/budget-trees'
import { ProvisionList } from '../../_components/provision-list'

/* No `generateStaticParams`. These pages read `?fy=`, so what they render
   depends on the query string and there is no one page to prerender — an
   office's FY 2026 page and its FY 2025 page are the same route. They are
   rendered on demand instead, which is the cost of switching the year in
   place rather than giving each year its own path. */
export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<{ fy?: string }>
}): Promise<Metadata> {
	const { budget, findOffice } = budgetFor((await searchParams).fy)
	const office = findOffice((await params).slug)
	if (!office) return { title: 'Office not found' }

	return {
		title: office.name,
		description: `${office.name} was appropriated ${peso(office.totals.total)} in the FY ${
			budget.fiscalYear
		} Bangsamoro budget — ${percent(office.share)} of the region's total. What it is funded to do, line by line.`,
	}
}

/**
 * The line that says what kind of office this is, in words rather than in the
 * Act's categories.
 *
 * "Special Purpose Fund" and "Other Executive Office" are terms of art that
 * mean something precise and nothing obvious, and an office page that opens
 * with one has lost the reader on the first line.
 */
function whatItIs(office: Office): string {
	if (office.kind === 'special_purpose_fund') {
		return 'A special purpose fund: money set aside for one thing across the whole region, released to the offices that spend it rather than budgeted inside any of them.'
	}
	if (office.parent) {
		return `An agency attached to the ${office.parent.name}. It is budgeted separately, with its own programs and its own figures, and its appropriation is not counted inside its parent's.`
	}
	if (office.budgetGroup === 'Other Executive Offices') {
		return 'An executive office outside the ministries — budgeted in its own right rather than under one of them.'
	}
	return `A ${office.officeType.toLowerCase()} of the Bangsamoro Government, budgeted as Part ${office.code} of the Act.`
}

export default async function OfficePage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<{ fy?: string }>
}) {
	const fy = (await searchParams).fy
	const { budget, findOffice, offices, provisionsFor } = budgetFor(fy)
	const office = findOffice((await params).slug)
	if (!office) notFound()


	const rules = provisionsFor(office.slug)

	// Section numbers as a running count rather than arithmetic over which
	// blocks happen to be present. Most offices have no attached agencies and
	// only one has a project list, so the numbering was a set of expressions
	// like `3 + (rules.length ? 1 : 0) + ...` that each had to be re-derived by
	// hand whenever a section moved. The ternaries below call this only when
	// they actually render, so the count is what the reader sees.
	let step = 0
	const nextIndex = () => String(++step).padStart(2, '0')

	// Where it sits among the offices that are budgeted in their own right.
	const peers = offices.filter((one) => one.kind !== 'sub_office')
	const rank = peers.findIndex((one) => one.slug === office.slug) + 1

	// This office's own projects grouped by area, largest first. Built here
	// rather than filtered out of the workspace-wide grouping, so it stays
	// correct if a second office is ever given a project list of its own.
	const projectsHere = [
		...office.projects.reduce((groups, project) => {
			const group = groups.get(project.province) ?? { province: project.province, count: 0, total: 0 }
			group.count += 1
			group.total += project.amount
			return groups.set(project.province, group)
		}, new Map<string, { province: string; count: number; total: number }>()),
	]
		.map(([, group]) => group)
		.sort((a, b) => b.total - a.total)

	return (
		<div>
			<Masthead
				back={{ href: '/offices', label: 'All offices' }}
				kicker={`${office.officeType} · Part ${office.code} of ${budget.act}`}
				title={office.name}
				/* What the office is, then where its figures came from, in one
				   paragraph. The provenance used to sit at the foot of the page as a
				   note of its own; it is the first thing to know about a page of
				   figures rather than the last, and run on from the description it
				   reads as a sentence instead of a footnote. */
				lead={
					<>
						<span>{whatItIs(office)}</span>
						{office.parent ? (
							<>
								{' '}
								<YearLink href={`/offices/${office.parent.slug}`} className='rule-link'>
									See the {office.parent.name}
								</YearLink>
								.
							</>
						) : null}{' '}
						<SourceNote pages={office.sourcePages} what='Figures' fy={fy} inline />
					</>
				}
			>
				<StatRow
					stats={[
						{ value: office.totals.total, label: `Appropriated for ${budget.fiscalYear}`, money: true },
						...(office.subOffices.length
							? [
									{
										value: office.totalWithSubOffices,
										label: 'With attached agencies',
										money: true,
									},
								]
							: []),
						{ value: office.share, label: 'Of the whole budget', decimals: 1, suffix: '%' },
						...(rank > 0 && !office.parent
							? [{ value: rank, label: `Largest of ${peers.length} offices` }]
							: []),
					].slice(0, 4)}
				/>

			</Masthead>

			{/* ---- The split ---- */}
			<section className='bb-container section-band'>
				<SectionHead
					index={nextIndex()}
					eyebrow='What kind of spending'
					size='sm'
					title='Salaries, running costs,'
					titleMuted='and things built.'
					lead={`Of the ${peso(
						office.totals.total,
					)} this office was given, this is how the Act divides it.`}
				/>

				<div className='mt-6'>
					<ExpenseSplit totals={office.totals} />
				</div>
			</section>

			{/* ---- What it is funded to do ---- */}
			{office.programs.length ? (
				<section className='bb-container section-band'>
					<SectionHead
						index={nextIndex()}
						eyebrow='What it is funded to do'
						size='sm'
						title='The programs'
						titleMuted='the Act pays for.'
						lead='Every office is budgeted under the same three headings — running the office, supporting the work, and the work itself. What is under Operations is what this office actually does.'
					/>

					<div className='mt-6'>
						<ProgramTree lines={office.programs} />
					</div>

					{/* Said once, here, rather than as a footnote on every row it
					    applies to. */}
					<p className='mt-6 text-[12px] leading-6 text-[var(--ink-3)]'>
						Rows are reproduced as the Act prints them. In several offices Personnel Services is
						printed against Operations as a whole and not against the programs beneath it, so a
						column of program rows can total less than the heading above it.
					</p>
				</section>
			) : null}

			{/* ---- What it is spent on ---- */}
			{office.objects.length ? (
				<section className='bb-container section-band'>
					<SectionHead
						index={nextIndex()}
						eyebrow='What it is spent on'
						size='sm'
						title='Every object'
						titleMuted='of expenditure.'
						lead='The other half of the Act: the same money again, sorted by what it buys rather than by what it is for. Salaries by kind, then every running cost down to the fuel and the water bill, then whatever is being built or bought outright.'
					/>

					<div className='mt-6'>
						<ObjectTree lines={office.objects} whole={office.totals.total} />
					</div>
				</section>
			) : null}

			{/* ---- The rules on the money ---- */}
			{rules.length ? (
				/* The one section on a ground rather than on paper. The rules are the
				   Act's own words where every other section here is our table of its
				   figures, and the tint says so without a heading having to.

				   The ground goes on the section and the rhythm on the div inside it,
				   because `bb-container` caps the width — left on one element the tint
				   would stop at the text column and read as a floating panel rather
				   than a band across the page. The tint is also the divider, so the
				   rule that every other section carries comes off. */
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container section-band'>
						<SectionHead
							index={nextIndex()}
							eyebrow='What the Act requires'
							size='sm'
							title={`${rules.length} ${rules.length === 1 ? 'rule is' : 'rules are'} attached`}
							titleMuted='to this money.'
							lead={`The special provisions for this office: the conditions Parliament put on the ${peso(
								office.totals.total,
							)} above — who it must reach, what it may not be spent on, and what has to be reported. Quoted in full, because a paraphrase of a rule is a different rule.`}
						/>

						<div className='mt-6'>
							<ProvisionList provisions={rules} />
						</div>
					</div>
				</section>
			) : null}

			{/* ---- Attached agencies ---- */}
			{office.subOffices.length ? (
				<section className='bb-container section-band'>
					<SectionHead
						index={nextIndex()}
						eyebrow='Attached agencies'
						size='sm'
						title={`${office.subOffices.length} ${
							office.subOffices.length === 1 ? 'agency is' : 'agencies are'
						} budgeted`}
						titleMuted='under this office.'
						lead={`Each has its own appropriation and its own pages in the Act. The ${peso(
							office.totals.total,
						)} above does not include them; together with this office they come to ${peso(
							office.totalWithSubOffices,
						)}.`}
					/>

					<Stagger gap={0.05} className='mt-6'>
						{office.subOffices.map((sub) => (
							<StaggerItem key={sub.slug} distance={12}>
								<YearLink
									href={`/offices/${sub.slug}`}
									className='group flex items-baseline justify-between gap-6 border-t border-[var(--rule)] py-4 transition hover:border-[var(--accent)] hover:bg-[var(--paper-2)]'
								>
									<span className='flex items-baseline gap-2 text-[14.5px] font-semibold tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
										{sub.name}
										<ArrowUpRightIcon
											className='size-3.5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
											aria-hidden='true'
										/>
									</span>
									<span className='money whitespace-nowrap text-[13.5px] font-semibold text-[var(--ink-2)] transition group-hover:text-[var(--accent)]'>
										{peso(sub.total)}
									</span>
								</YearLink>
							</StaggerItem>
						))}
					</Stagger>
				</section>
			) : null}

			{/* ---- What it is building ---- */}
			{office.projects.length ? (
				<section className='bb-container section-band'>
					<SectionHead
						index={nextIndex()}
						eyebrow='What it is building'
						size='sm'
						title={`${office.projects.length} named projects,`}
						titleMuted='with the barangay on each.'
						lead={`This office is the only one in the Act whose construction is listed project by project — ${peso(
							office.projects.reduce((sum, project) => sum + project.amount, 0),
						)} across ${projectsHere.length} provinces and areas, each with the road, bridge or building it pays for named.`}
						aside={
							<YearLink href='/projects' className='rule-link text-[12px]'>
								Search every project
							</YearLink>
						}
					/>

					<div className='mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3'>
						{projectsHere.map((group) => (
							<YearLink
								key={group.province}
								href={`/projects?q=${encodeURIComponent(group.province)}`}
								/* The rule takes the accent on hover along with the type. It is
								   the only edge these cards have, so leaving it grey while the
								   name lit up made the card look half-awake. */
								className='group border-t border-[var(--rule)] py-4 transition hover:border-[var(--accent)] hover:bg-[var(--paper-2)]'
							>
								<p className='text-[14px] font-semibold tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
									{group.province}
								</p>
								<p className='money mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] transition group-hover:text-[var(--accent)]'>
									{group.count} projects · {peso(group.total)}
								</p>
							</YearLink>
						))}
					</div>
				</section>
			) : null}
		</div>
	)
}
