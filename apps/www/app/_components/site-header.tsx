'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

type SiteHeaderProps = {
	activeItem?: 'discover' | 'about' | 'contribute'
}

const navItems = [
	{
		key: 'discover',
		label: 'Discover BARMM',
		href: '/discover',
	},
	{
		key: 'about',
		label: 'About',
		href: '/about',
	},
	{
		key: 'contribute',
		label: 'Contribute',
		href: '/contribute',
	},
] as const

const workspaceItems = [
	{
		label: 'Budget',
		href: 'https://budget.betterbarmm.com',
	},
	{
		label: 'Bills',
		href: 'https://bills.betterbarmm.com',
	},
	{
		label: 'Election',
		href: 'https://election.betterbarmm.com',
	},
] as const

export function SiteHeader({ activeItem }: SiteHeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const navTextClass = 'hover:text-[var(--accent)]'
	const navLinkClass = (item: SiteHeaderProps['activeItem']) => `block ${navTextClass} ${activeItem === item ? 'font-bold text-[var(--ink)]' : ''}`

	return (
		<header className='sticky top-0 z-20 border-b border-[var(--ink)] bg-[var(--paper)]'>
			<div className='mx-auto max-w-7xl px-5 pb-3 pt-2 sm:px-8'>
				<div className='mb-3 hidden border-b border-[var(--rule-soft)] pb-2 font-mono text-[10px] font-semibold uppercase leading-5 tracking-[0.18em] text-[var(--ink-3)] sm:flex sm:items-center sm:justify-between sm:gap-4'>
					<a
						href='https://betterbarmm.com'
						className='w-fit transition hover:text-[var(--accent)]'
					>
						betterbarmm.com
					</a>
					<div className='flex items-center gap-5'>
						<a
							href='https://www.facebook.com/betterbarmm'
							target='_blank'
							rel='noreferrer'
							className='w-fit transition hover:text-[var(--accent)]'
						>
							Facebook
						</a>
						<a
							href='mailto:support@betterbarmm.com'
							className='w-fit transition hover:text-[var(--accent)]'
						>
							support@betterbarmm.com
						</a>
					</div>
				</div>

				<div className='flex items-center justify-between gap-4 py-2'>
					<a
						href='/'
						className='w-fit text-xl font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)] sm:text-2xl'
						onClick={() => setIsMenuOpen(false)}
					>
						<span className='bg-[var(--accent)] px-1 text-white'>Better</span>
						<span>BARMM</span>
					</a>

					<nav className='hidden items-center justify-end gap-6 font-mono text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)] md:flex'>
						<div className='group relative'>
							<button
								type='button'
								className={`flex items-center gap-1 uppercase ${navTextClass}`}
								aria-haspopup='true'
							>
								<span>Workspaces</span>
								<ChevronDown
									aria-hidden='true'
									className='h-3 w-3 stroke-[2.5]'
								/>
							</button>
							<div className='invisible absolute left-0 top-full z-30 w-48 pt-3 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100'>
								<div className='border border-[var(--ink)] bg-[var(--paper)] shadow-sm'>
									{workspaceItems.map((item) => (
										<a
											key={item.href}
											href={item.href}
											className='block border-b border-[var(--rule-soft)] px-4 py-3 text-[10px] transition last:border-b-0 hover:bg-[var(--paper-2)] hover:text-[var(--accent)]'
										>
											{item.label}
										</a>
									))}
								</div>
							</div>
						</div>
						{navItems.map((item) => (
							<a
								key={item.href}
								className={navLinkClass(item.key)}
								href={item.href}
							>
								{item.label}
							</a>
						))}
					</nav>

					<button
						type='button'
						aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
						aria-expanded={isMenuOpen}
						aria-controls='site-mobile-menu'
						onClick={() => setIsMenuOpen((current) => !current)}
						className='inline-flex h-8 w-8 items-center justify-center border border-[var(--rule)] text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--paper-2)] md:hidden'
					>
						<span className='sr-only'>{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
						<span
							aria-hidden='true'
							className='flex h-3 w-4 flex-col justify-between'
						>
							<span className={`block h-px bg-current transition ${isMenuOpen ? 'translate-y-[5.5px] rotate-45' : ''}`} />
							<span className={`block h-px bg-current transition ${isMenuOpen ? 'opacity-0' : ''}`} />
							<span className={`block h-px bg-current transition ${isMenuOpen ? '-translate-y-[5.5px] -rotate-45' : ''}`} />
						</span>
					</button>
				</div>

				<nav
					id='site-mobile-menu'
					className={`grid overflow-hidden border-[var(--rule-soft)] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition-[grid-template-rows,opacity,margin,padding,border-width] duration-200 md:hidden ${
						isMenuOpen ? 'mt-4 grid-rows-[1fr] border-t pt-4 opacity-100' : 'mt-0 grid-rows-[0fr] border-t-0 pt-0 opacity-0'
					}`}
				>
					<div className='min-h-0 overflow-hidden'>
						<div className='grid gap-3'>
							<div className='border-b border-[var(--rule-soft)] pb-3'>
								<p className='mb-2 text-[9px] tracking-[0.18em] text-[var(--accent)]'>Workspaces</p>
								<div className='grid gap-2 pl-3'>
									{workspaceItems.map((item) => (
										<a
											key={item.href}
											href={item.href}
											className='block hover:text-[var(--accent)]'
											onClick={() => setIsMenuOpen(false)}
										>
											{item.label}
										</a>
									))}
								</div>
							</div>
							{navItems.map((item) => (
								<a
									key={item.href}
									className={`${navLinkClass(item.key)} border-b border-[var(--rule-soft)] pb-3 last:border-b-0`}
									href={item.href}
									onClick={() => setIsMenuOpen(false)}
								>
									{item.label}
								</a>
							))}
						</div>
					</div>
				</nav>
			</div>
		</header>
	)
}
