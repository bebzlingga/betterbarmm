/* The band the landing site's Directory and Programs & services open on (user decision), ranged left: a label, the
   title, and what the page holds under it. The registry's lists and the journal open on it. */

export function RegistryBand({ label, title, lead, children }: { label: string; title: string; lead?: React.ReactNode; children?: React.ReactNode }) {
	return (
		<section className='brand-bg bb-lattice relative overflow-hidden'>
			<span
				aria-hidden='true'
				className='bb-glow absolute -left-[16rem] -top-[22rem] h-[40rem] w-[64rem] max-w-[160vw] bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
			/>
			<div className='bb-container relative py-16 lg:py-24'>
				<p className='bb-label'>{label}</p>
				<h1 className='bb-display-md mt-4 text-[var(--ink)]'>{title}</h1>
				{lead ? <p className='mt-4 lg:max-w-[80%] text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{lead}</p> : null}
				{children}
			</div>
		</section>
	)
}

/** A section's heading as the landing site sets it: the title, its count beside it muted, a line on the right. */
export function BandSectionTitle({ title, count, lead }: { title: string; count?: number; lead?: string }) {
	return (
		<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
			<h2 className='text-[1.625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
				{title} {count != null ? <span className='text-[var(--ink-mute)]'>· {count}</span> : null}
			</h2>
			{lead ? <p className='max-w-xl text-[0.84375rem] leading-[1.6] text-[var(--ink-3)]'>{lead}</p> : null}
		</div>
	)
}
