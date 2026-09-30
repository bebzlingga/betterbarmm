import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { Rise, SectionHead } from '@betterbarmm/editorial'
import { budgetFor, percent, peso } from '@betterbarmm/budget-data'
import { YearLink } from '../../_components/year-link'
import { notFound } from 'next/navigation'
import { Masthead, StatRow } from '../../_components/budget-parts'
import { ProvisionList } from '../../_components/provision-list'
import { SectorIcon } from '../../_components/sector-icon'

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
	const { budget, findSector } = budgetFor((await searchParams).fy)
	const sector = findSector((await params).slug)
	if (!sector) return { title: 'Sector not found' }

	return {
		title: sector.name,
		description: `${sector.count} lines of the FY ${budget.fiscalYear} Bangsamoro budget are about ${sector.name.toLowerCase()} — ${sector.description}`,
	}
}

export default async function SectorPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<{ fy?: string }>
}) {
	const fy = (await searchParams).fy
	const { budget, findSector, sectorContents } = budgetFor(fy)
	const sector = findSector((await params).slug)
	if (!sector) notFound()

	const { programs, provisions } = sectorContents(sector.tag)

	// Which offices spend on this, largest first. The point of the page: a
	// sector is almost never one ministry's business.
	const byOffice = [
		...programs.reduce((offices, program) => {
			const one = offices.get(program.officeSlug) ?? {
				slug: program.officeSlug,
				name: program.office,
				total: 0,
				count: 0,
			}
			one.total += program.total
			one.count += 1
			return offices.set(program.officeSlug, one)
		}, new Map<string, { slug: string; name: string; total: number; count: number }>()),
	]
		.map(([, one]) => one)
		.sort((a, b) => b.total - a.total)

	return (
		<>
			<Masthead
				back={{ href: '/sectors', label: 'All sectors' }}
				kicker={`Sector · fiscal year ${budget.fiscalYear}`}
				title={sector.name}
				mark={
					<SectorIcon slug={sector.slug} className='size-9 text-[var(--brass)] lg:size-11' />
				}
				lead={
					<>
						{sector.description}. Everything the Act says on it, wherever in the Act it says it —{' '}
						{byOffice.length === 1
							? 'all of it in one office'
							: `spread across ${byOffice.length} offices`}
						.
					</>
				}
			>
				<StatRow
					stats={[
						...(sector.total > 0
							? [{ value: sector.total, label: 'In program rows', money: true }]
							: []),
						{ value: programs.length, label: 'Programs' },
						{ value: provisions.length, label: 'Rules in the Act' },
						{ value: byOffice.length, label: 'Offices involved' },
					].slice(0, 4)}
				/>
			</Masthead>

			{/* ---- Who spends it ---- */}
			{byOffice.length > 0 ? (
				<section className='bb-container section-band'>
					<SectionHead
						index='01'
						eyebrow='Who spends it'
						size='sm'
						title={
							byOffice.length === 1 ? 'One office' : `${byOffice.length} offices`
						}
						titleMuted='spend on this.'
						lead='The Act files money by office, so a sector is scattered through it. This is the scatter, gathered.'
					/>

					<div className='mt-6'>
						{byOffice.map((office) => (
							<YearLink
								key={office.slug}
								href={`/offices/${office.slug}`}
								/* No rule above the first: the SectionHead closes on a brass line
								   already, and a second hairline under it reads as a mistake.

								   The two trailing tracks are sized, not `auto`. Every row is its
								   own grid, so `auto` measured each row's own content and the
								   counts and figures came out on a different edge in every row.
								   Fixed tracks are shared by construction, and `.money` is
								   tabular, so the widths hold: the longest figure any sector page
								   prints is eighteen glyphs and the longest count eleven. */
								className='group grid items-baseline gap-x-8 gap-y-2 border-t border-[var(--rule)] py-4 transition first:border-t-0 hover:bg-[var(--paper-2)] sm:grid-cols-[minmax(0,1fr)_7rem_10.5rem]'
							>
								<span className='flex items-baseline gap-2 text-[14.5px] font-semibold tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
									{office.name}
									<ArrowUpRightIcon
										className='size-3.5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
										aria-hidden='true'
									/>
								</span>
								{/* The gap is the grid's now, not a margin on this cell: with a
								    sized track a right margin only pulled the count off its own
								    column's edge. */}
								<span className='money font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--ink-mute)] sm:text-right'>
									{office.count} {office.count === 1 ? 'program' : 'programs'}
								</span>
								{/* No fixed width. At `w-28` the box was 7rem and a figure of
								    eighteen glyphs is half as wide again, so `text-right` had
								    nothing to align inside and the amount sat off the right edge
								    of its own column. The track is `auto`, so letting it size to
								    the figure puts every row's last character on one line. */}
								<span className='money text-[13.5px] font-semibold text-[var(--ink)] sm:text-right'>
									{peso(office.total)}
								</span>
							</YearLink>
						))}
					</div>
				</section>
			) : null}

			{/* ---- The programs ---- */}
			{programs.length > 0 ? (
				<section className='bb-container border-t border-[var(--rule)] section-band-bottom'>
					<SectionHead
						index='02'
						eyebrow='The lines themselves'
						size='sm'
						title={`${programs.length} ${programs.length === 1 ? 'program' : 'programs'},`}
						titleMuted='largest first.'
						lead={`Each is a row the Act prints against an office, tagged to this sector. Amounts are exactly as printed — ${percent(
							(sector.total / budget.total) * 100,
						)} of the region's total sits in these rows, though a line counted here may be counted under another sector too.`}
					/>

					<div className='mt-6'>
						{programs.slice(0, 40).map((program) => (
							<article
								key={program.id}
								/* `first:border-t-0` for the same reason, and `items-center` so
								   the amount sits on the middle of its row rather than on the
								   first of the two lines beside it. */
								className='grid items-center gap-x-10 gap-y-2 border-t border-[var(--rule)] py-4 first:border-t-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,10rem)]'
							>
								<div className='min-w-0'>
									<p className='text-[14px] font-medium leading-snug text-[var(--ink)]'>
										{program.path}
									</p>
									<p className='mt-1.5 text-[12px] text-[var(--ink-3)]'>
										<YearLink href={`/offices/${program.officeSlug}`} className='rule-link'>
											{program.office}
										</YearLink>
									</p>
								</div>
								<p className='money text-[14px] font-semibold text-[var(--ink)] lg:text-right'>
									{peso(program.total)}
								</p>
							</article>
						))}
					</div>

					{programs.length > 40 ? (
						<Rise distance={12}>
							<YearLink
								href={`/programs?q=${encodeURIComponent(sector.tag)}`}
								className='bb-btn bb-btn-ghost mt-8'
							>
								All {programs.length} in the program browser
								<ArrowUpRightIcon size={14} aria-hidden='true' />
							</YearLink>
						</Rise>
					) : null}
				</section>
			) : null}

			{/* ---- The rules ---- */}
			{provisions.length > 0 ? (
				/* The one section set on a ground rather than on paper. The rules are
				   quoted text where every other section on the page is figures, and
				   the tint is what separates the Act's own words from our tables
				   without a heading having to say so.

				   The ground is on the section and the rhythm on the div inside it,
				   because `bb-container` caps the width — left on the same element the
				   tint would have stopped at the text column and read as a panel
				   floating in the page rather than as a band across it. */
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container section-band'>
						<SectionHead
							index='03'
							eyebrow='What the Act requires'
							size='sm'
							title={`${provisions.length} ${provisions.length === 1 ? 'rule' : 'rules'}`}
							titleMuted='attached to this money.'
							lead='A special provision is the condition Parliament put on an appropriation — who it must reach, what it may not be spent on, what has to be reported and to whom. These are the ones about this sector, quoted in full.'
						/>

						<div className='mt-6'>
							<ProvisionList provisions={provisions} showOffice />
						</div>
					</div>
				</section>
			) : null}
		</>
	)
}
