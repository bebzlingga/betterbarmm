/**
 * A section's heading in the travel look (user decision), standing in for the estate's SectionHead on the budget's
 * pages: what the section is about as a small accent kicker, the claim as one heading with its qualifier in the muted
 * grey, and the line on what it holds on the right. No numbered spine or rule above it. Same props as the shared one,
 * so a page swaps the import and nothing else; `index` and `size` are accepted and left unused.
 */
export function SectionHead({
	eyebrow,
	title,
	titleMuted,
	lead,
	aside,
}: {
	index?: string
	eyebrow?: string
	title: string
	titleMuted?: string
	lead?: string
	aside?: React.ReactNode
	size?: 'md' | 'sm'
}) {
	return (
		<div className='flex flex-wrap items-end justify-between gap-x-10 gap-y-4'>
			<div className='min-w-0'>
				{eyebrow ? <p className='text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>{eyebrow}</p> : null}
				<h2 className='dv-title mt-2'>
					{title} {titleMuted ? <span className='text-[var(--ink-mute)]'>{titleMuted}</span> : null}
				</h2>
			</div>
			{lead || aside ? (
				<div className='max-w-xl'>
					{lead ? <p className='text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]'>{lead}</p> : null}
					{aside}
				</div>
			) : null}
		</div>
	)
}
