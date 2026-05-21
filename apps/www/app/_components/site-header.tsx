type SiteHeaderProps = {
	activeItem?: 'discover' | 'about' | 'contact'
}

export function SiteHeader({ activeItem }: SiteHeaderProps) {
	const navLinkClass = (item: SiteHeaderProps['activeItem']) => `hover:text-[var(--accent)] ${activeItem === item ? 'font-bold border-[var(--accent)] text-[var(--ink)]' : ''}`

	return (
		<header className='sticky top-0 z-20 border-b border-[var(--ink)] bg-[var(--paper)]'>
			<div className='mx-auto max-w-7xl px-5 py-5 pt-3 sm:px-8'>
				<div className='flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--rule-soft)] pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-3)]'>
					<span>betterbarmm.com</span>
					<span>Transparency / Public records / Civic data</span>
				</div>
				<div className='flex flex-wrap items-center justify-between gap-5 pt-4'>
					<a
						href='/'
						className='text-2xl font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'
					>
						<span className='bg-[var(--accent)] px-1 text-white'>Better</span>
						<span>BARMM</span>
					</a>
					<nav className='flex flex-wrap gap-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
						<a
							className={navLinkClass('discover')}
							href='/discover'
						>
							Discover BARMM
						</a>
						<a
							className={navLinkClass('about')}
							href='/about'
						>
							About
						</a>
						<a
							className={navLinkClass('contact')}
							href='/contact'
						>
							Contact Us
						</a>
					</nav>
				</div>
			</div>
		</header>
	)
}
