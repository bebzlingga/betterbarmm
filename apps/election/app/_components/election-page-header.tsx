type ElectionPageHeaderProps = {
	eyebrow: string
	title: string
	description: string
	meta?: string
}

export function ElectionPageHeader({ eyebrow, title, description, meta }: ElectionPageHeaderProps) {
	return (
		<section className='relative overflow-hidden border-b border-[var(--ink)]'>
			<div
				className='absolute inset-0 opacity-70'
				aria-hidden='true'
			>
				<div className='absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,var(--rule-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--rule-soft)_1px,transparent_1px)] bg-[size:72px_72px] sm:bg-[size:96px_96px]' />
			</div>

			<div className='relative mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20 lg:py-28'>
				<div className='justify-between gap-6 lg:flex-row lg:items-end'>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
						<p className='eyebrow'>{eyebrow}</p>
						{meta ? (
							<p className='max-w-full break-words font-mono text-[9px] font-semibold uppercase leading-5 tracking-[0.16em] text-[var(--ink-3)] sm:w-fit sm:text-[10px] sm:tracking-[0.18em] lg:shrink-0 lg:self-start lg:whitespace-nowrap lg:text-right'>
								{meta}
							</p>
						) : null}
					</div>
					<h1 className='mt-4 max-w-full text-4xl font-extrabold leading-[0.94] tracking-[-0.04em] sm:mt-5 sm:text-6xl md:text-7xl lg:text-[8rem]'>{title}</h1>
				</div>
				<p className='mt-6 max-w-3xl text-base leading-snug text-[var(--ink-2)] sm:mt-8 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9'>{description}</p>
			</div>
		</section>
	)
}
