import { HomeHeroSlider } from './_components/home-hero-slider'
import { SiteHeader } from './_components/site-header'

const portalCards = [
	{
		label: 'Data',
		title: 'Open the source layer',
		description: 'Browse published datasets, source documents, validation notes, and release context in one place.',
		href: '/budget/data',
		measure: 'PDFs and JSON',
		status: 'Soon',
	},
	{
		label: 'Budget',
		title: 'Follow the money',
		description: 'Explore BARMM appropriations by fiscal year, office, program, and source-backed budget line.',
		href: 'https://budget.betterbarmm.com',
		measure: 'GAAB FY 2020-2026',
		status: 'Open',
	},
	{
		label: 'Bills',
		title: 'Know your laws',
		description: 'Track proposed measures, authors, committees, readings, and legislative movement as public records mature.',
		href: '/bills',
		measure: 'Legislative records',
		status: 'Soon',
	},
	{
		label: 'Figures',
		title: 'Know the public figures',
		description: 'Get to know Bangsamoro leaders, including Members of Parliament, ministers, offices, and public roles.',
		href: '/figures',
		measure: 'People and offices',
		status: 'Soon',
	},
	{
		label: 'Infra',
		title: 'Track Public Works',
		description: 'See infrastructure development across the Bangsamoro region, from project locations to public investment trails.',
		href: '/infra',
		measure: 'Infrastructure tracker',
		status: 'Soon',
	},
	{
		label: 'Governance',
		title: 'Map Local Government Units',
		description: 'Browse provinces, cities, municipalities, barangays, and local governance layers in one public directory.',
		href: '/governance',
		measure: 'LGU directory',
		status: 'Soon',
	},
	{
		label: 'Services',
		title: 'Find Public Services',
		description: 'Locate public services, offices, requirements, and assistance channels as the service layer comes online.',
		href: '/services',
		measure: 'Service finder',
		status: 'Soon',
	},
	{
		label: 'Places',
		title: 'Discover Places',
		description: 'Explore destinations, heritage sites, cultural landmarks, and tourism context across the Bangsamoro region.',
		href: '/places',
		measure: 'Tourism guide',
		status: 'Soon',
	},
]

export default function HomePage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<section className='relative overflow-hidden border-b border-[var(--ink)]'>
				<div
					className='absolute inset-0 opacity-70'
					aria-hidden='true'
				>
					<div className='absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,var(--rule-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--rule-soft)_1px,transparent_1px)] bg-[size:72px_72px] sm:bg-[size:96px_96px]' />
				</div>

				<div className='relative mx-auto max-w-7xl px-8 py-12 sm:py-20 lg:py-32'>
					<HomeHeroSlider />
				</div>
			</section>

			<div className='mx-auto max-w-7xl px-8 py-8'>
				<section className='pb-20 pt-14 sm:pb-24 sm:pt-20'>
					<div className='flex flex-col items-start justify-between gap-5 border-b border-[var(--ink)] pb-10 sm:gap-6 sm:pb-16 lg:flex-row lg:items-end'>
						<div>
							<p className='eyebrow'>Public workspaces</p>
							<h2 className='mt-3 max-w-3xl text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl lg:text-6xl'>Start with the records.</h2>
						</div>
						<p className='max-w-xl text-sm leading-6 text-[var(--ink-3)] sm:text-base'>
							Each workspace is designed around the same promise: show the public record, explain the method, and keep the trail visible.
						</p>
					</div>

					<div className='grid sm:grid-cols-2 lg:grid-cols-3'>
						{portalCards.map((card, index) => (
							<WorkspaceCard
								key={card.title}
								card={card}
								index={index}
							/>
						))}
					</div>
				</section>
			</div>
		</main>
	)
}

function WorkspaceCard({ card, index }: { card: (typeof portalCards)[number]; index: number }) {
	const isOpen = card.status === 'Open'
	const content = (
		<>
			<div className='flex items-center justify-between gap-4'>
				<div>
					<p className='eyebrow'>
						0{index + 1} / {card.label}
					</p>
				</div>

				<span
					className={`inline-flex h-6 items-center font-mono font-semibold uppercase leading-none tracking-[0.14em] ${isOpen ? 'text-[11px] text-[var(--accent)] group-hover:text-[var(--ink)]' : 'bg-[var(--accent)] px-2 text-[9px] text-[var(--paper)]'}`}
				>
					{card.status}
				</span>
			</div>
			<h3 className='mt-4 text-2xl font-extrabold tracking-[-0.02em]'>{card.title}</h3>
			<p className='mt-2 text-sm leading-5 text-[var(--ink-2)] sm:min-h-20 sm:pr-4 lg:pr-8'>{card.description}</p>
			<div className='mt-8 flex flex-col gap-2 border-t border-[var(--rule-soft)] pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:tracking-[0.16em]'>
				<span>{card.measure}</span>
				<span className='hidden sm:inline'>{isOpen ? 'Source-backed' : 'In progress'}</span>
			</div>
		</>
	)
	const className =
		'group border-b border-[var(--rule)] py-5 text-[var(--ink)] transition hover:bg-[var(--paper-2)] sm:border-r sm:p-6 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0'

	if (isOpen) {
		return (
			<a
				href={card.href}
				className={className}
			>
				{content}
			</a>
		)
	}

	return <article className={className}>{content}</article>
}
