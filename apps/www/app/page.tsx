import { BankIcon, BuildingsIcon, CheckSquareOffsetIcon, DatabaseIcon, HandshakeIcon, HardHatIcon, MapTrifoldIcon, ScrollIcon } from '@phosphor-icons/react/ssr'
import { HomeHeroSlider } from './_components/home-hero-slider'
import { SiteHeader } from './_components/site-header'

const electionWorkspace = {
	label: 'Election',
	title: 'A Better Bangsamoro Begins With Your Vote',
	description:
		'Explore BARMM parliamentary parties, candidates, districts, sectoral seats, developing stories, and source-backed records for the 2026 Parliamentary Elections.',
	href: 'https://election.betterbarmm.com',
	measure: '2026 Parliamentary Elections',
	icon: CheckSquareOffsetIcon,
}

const upcomingWorkspaces = [
	{
		label: 'Budget',
		title: 'Follow the money',
		description: 'Explore BARMM appropriations by fiscal year, office, program, and source-backed budget line.',
		measure: 'GAAB FY 2020-2026',
		icon: BankIcon,
	},
	{
		label: 'Bills',
		title: 'Know your laws',
		description: 'Track proposed measures, authors, committees, readings, and legislative movement as public records mature.',
		measure: 'Legislative records',
		icon: ScrollIcon,
	},
	{
		label: 'Data',
		title: 'Open the source layer',
		description: 'Browse published datasets, source documents, validation notes, and release context in one place.',
		measure: 'PDFs and JSON',
		icon: DatabaseIcon,
	},
	{
		label: 'Infra',
		title: 'Track public works',
		description: 'See infrastructure development across the Bangsamoro region, from project locations to public investment trails.',
		measure: 'Infrastructure tracker',
		icon: HardHatIcon,
	},
	{
		label: 'Governance',
		title: 'Map local government units',
		description: 'Browse provinces, cities, municipalities, barangays, and local governance layers in one public directory.',
		measure: 'LGU directory',
		icon: BuildingsIcon,
	},
	{
		label: 'Services',
		title: 'Find public services',
		description: 'Locate public services, offices, requirements, and assistance channels as the service layer comes online.',
		measure: 'Service finder',
		icon: HandshakeIcon,
	},
	{
		label: 'Places',
		title: 'Discover places',
		description: 'Explore destinations, heritage sites, cultural landmarks, and tourism context across the Bangsamoro region.',
		measure: 'Tourism guide',
		icon: MapTrifoldIcon,
	},
]

export default function HomePage() {
	const FeaturedIcon = electionWorkspace.icon

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<section className='relative overflow-hidden border-b border-black/20 bg-[var(--accent)] text-white'>
				<div
					className='pointer-events-none absolute inset-0'
					aria-hidden='true'
				>
					<div
						className='absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.13)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.13)_1px,transparent_1px)] bg-[size:72px_72px] sm:bg-[size:96px_96px]'
						style={{
							WebkitMaskImage: 'radial-gradient(70% 75% at 72% 18%, #000 0%, rgba(0,0,0,0.35) 45%, transparent 74%)',
							maskImage: 'radial-gradient(70% 75% at 72% 18%, #000 0%, rgba(0,0,0,0.35) 45%, transparent 74%)',
						}}
					/>
				</div>

				<div className='relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-20 lg:py-32'>
					<HomeHeroSlider />
				</div>
			</section>

			<section className='border-b border-[var(--ink)]'>
				<div className='mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24'>
					<div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-8'>
						<div>
							<p className='eyebrow'>Live now</p>
							<h2 className='mt-3 max-w-2xl text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>Start with the election.</h2>
						</div>
						<p className='max-w-sm text-sm leading-6 text-[var(--ink-3)] sm:text-right sm:text-base'>
							The first BetterBARMM workspace is live. Everything in it traces back to a public record.
						</p>
					</div>

					<a
						href={electionWorkspace.href}
						className='group mt-8 flex flex-col gap-8 border border-[var(--ink)] bg-[var(--paper)] p-6 transition hover:bg-[var(--paper-2)] sm:mt-10 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:p-12'
					>
						<div className='max-w-2xl'>
							<div className='flex flex-wrap items-center gap-3'>
								<span className='inline-flex items-center bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-bold uppercase leading-none tracking-[0.16em] text-white'>Open</span>
								<p className='eyebrow'>01 / {electionWorkspace.label}</p>
							</div>
							<div className='mt-6 text-[var(--accent)]'>
								<FeaturedIcon
									className='size-12 sm:size-14'
									weight='duotone'
									aria-hidden='true'
								/>
							</div>
							<h3 className='mt-6 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl lg:text-5xl'>{electionWorkspace.title}</h3>
							<p className='mt-4 max-w-xl text-base leading-6 text-[var(--ink-2)] sm:text-lg sm:leading-7'>{electionWorkspace.description}</p>
							<div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
								<span>{electionWorkspace.measure}</span>
								<span>Source-backed</span>
							</div>
						</div>
						<span className='inline-flex w-full shrink-0 items-center justify-center border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--paper)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] sm:w-auto'>
							Open workspace →
						</span>
					</a>
				</div>
			</section>

			<section>
				<div className='mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24'>
					<div className='flex flex-col items-start justify-between gap-4 border-b border-[var(--ink)] pb-8 sm:flex-row sm:items-end sm:gap-8 sm:pb-10'>
						<div>
							<p className='eyebrow'>Coming soon</p>
							<h2 className='mt-3 max-w-2xl text-2xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl'>More public workspaces on the way.</h2>
						</div>
						<p className='max-w-sm text-sm leading-6 text-[var(--ink-3)] sm:text-right sm:text-base'>
							Each will follow the same promise: show the public record, explain the method, and keep the trail visible.
						</p>
					</div>

					<div className='grid sm:grid-cols-2 lg:grid-cols-3'>
						{upcomingWorkspaces.map((card, index) => {
							const Icon = card.icon

							return (
								<article
									key={card.label}
									className='flex min-h-full flex-col border-b border-[var(--rule)] p-5 text-[var(--ink-3)] sm:min-h-64 sm:border-r sm:p-6 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0'
								>
									<div className='flex items-center justify-between gap-4'>
										<p className='eyebrow text-[var(--ink-3)]!'>
											0{index + 2} / {card.label}
										</p>
										<span className='inline-flex items-center bg-[var(--ink-3)] px-2 py-1 font-mono text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-white'>Soon</span>
									</div>
									<div className='mt-6 text-[var(--ink-3)]'>
										<Icon
											className='size-10 sm:size-12'
											weight='duotone'
											aria-hidden='true'
										/>
									</div>
									<h3 className='mt-5 text-xl font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink-2)]'>{card.title}</h3>
									<p className='mt-2 text-sm leading-5 sm:min-h-15 sm:pr-4'>{card.description}</p>
									<div className='mt-auto border-t border-[var(--rule-soft)] pt-4 font-mono text-[10px] uppercase tracking-[0.14em]'>{card.measure}</div>
								</article>
							)
						})}
					</div>
				</div>
			</section>
		</main>
	)
}
