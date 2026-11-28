import { Hero } from './hero'

/* Every list in the registry, and the front page, open on the crimson header (user decision: the travel look). */
export function RegistryBand({
	label,
	title,
	lead,
	children,
	tall,
	auto,
	side,
}: {
	label: string
	title: string
	lead?: React.ReactNode
	children?: React.ReactNode
	tall?: boolean
	/** As tall as its words: a header that carries a lot. */
	auto?: boolean
	/** A card on the right of the words from a wide screen. */
	side?: React.ReactNode
}) {
	return (
		<Hero kicker={label} title={title} lede={lead} tall={tall} auto={auto} side={side}>
			{children}
		</Hero>
	)
}

/** A section's heading as the landing site sets it: the title, its count beside it muted, a line on the right. */
export function BandSectionTitle({ title, count, lead }: { title: string; count?: number; lead?: string }) {
	return (
		<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
			<h2 className='dv-title'>
				{title} {count != null ? <span className='ml-1 align-middle text-[0.55em] font-semibold tracking-normal text-[var(--ink-mute)]'>{count}</span> : null}
			</h2>
			{lead ? <p className='max-w-xl text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]'>{lead}</p> : null}
		</div>
	)
}
