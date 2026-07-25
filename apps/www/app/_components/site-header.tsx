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
		label: 'Election',
		href: 'https://election.betterbarmm.com',
		open: true,
	},
	{
		label: 'Budget',
		href: 'https://budget.betterbarmm.com',
		open: false,
	},
	{
		label: 'Bills',
		href: 'https://bills.betterbarmm.com',
		open: false,
	},
] as const

export function SiteHeader({ activeItem }: SiteHeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const navTextClass = 'transition hover:text-white'
	const navLinkClass = (item: SiteHeaderProps['activeItem']) => `block ${navTextClass} ${activeItem === item ? 'font-bold text-white' : 'text-white/80'}`

	return (
		<header className='sticky top-0 z-20 border-b border-black/20 bg-[var(--accent)] text-white'>
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
			<div className='relative mx-auto max-w-7xl px-5 pb-3 pt-1 sm:px-8'>
				<div className='mb-2 hidden border-b border-white/20 pb-1.5 font-mono text-[10px] font-black uppercase leading-5 tracking-[0.18em] text-white/75 sm:flex sm:items-center sm:justify-between sm:gap-4'>
					<a
						href='https://betterbarmm.com'
						className='w-fit transition hover:text-white'
					>
						betterbarmm.com
					</a>
					<div className='flex items-center gap-5'>
						<a
							href='https://www.facebook.com/betterbarmm'
							target='_blank'
							rel='noreferrer'
							className='w-fit transition hover:text-white'
						>
							Facebook
						</a>
						<a
							href='mailto:support@betterbarmm.com'
							className='w-fit transition hover:text-white'
						>
							support@betterbarmm.com
						</a>
					</div>
				</div>

				<div className='flex items-center justify-between gap-4 py-2'>
					<a
						href='/'
						className='w-fit shrink-0 text-lg font-black leading-none tracking-[-0.03em] text-white sm:text-2xl'
						onClick={() => setIsMenuOpen(false)}
					>
						<span className='bg-white px-1 text-[var(--accent)]'>Better</span>
						<span>BARMM</span>
					</a>

					<nav className='hidden items-center justify-end gap-6 font-mono text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-white/80 md:flex'>
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
							<div className='invisible absolute left-0 top-full z-30 w-52 pt-3 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100'>
								<div className='border border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] shadow-sm'>
									{workspaceItems.map((item) =>
										item.open ? (
											<a
												key={item.href}
												href={item.href}
												className='block border-b border-[var(--rule-soft)] px-4 py-3 text-[10px] transition last:border-b-0 hover:bg-[var(--paper-2)] hover:text-[var(--accent)]'
											>
												{item.label}
											</a>
										) : (
											<span
												key={item.href}
												className='flex items-center justify-between gap-3 border-b border-[var(--rule-soft)] px-4 py-3 text-[10px] text-[var(--ink-mute)] last:border-b-0'
											>
												{item.label}
												<span className='text-[8px] tracking-[0.18em] text-[var(--ink-3)]'>Soon</span>
											</span>
										),
									)}
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
						className='inline-flex h-8 w-8 items-center justify-center border border-white/40 text-white transition hover:border-white hover:bg-white/10 md:hidden'
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
					className={`grid overflow-hidden border-white/20 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 transition-[grid-template-rows,opacity,margin,padding,border-width] duration-200 md:hidden ${
						isMenuOpen ? 'mt-4 grid-rows-[1fr] border-t pt-4 opacity-100' : 'mt-0 grid-rows-[0fr] border-t-0 pt-0 opacity-0'
					}`}
				>
					<div className='min-h-0 overflow-hidden'>
						<div className='grid gap-3'>
							<div className='border-b border-white/15 pb-3'>
								<p className='mb-2 text-[9px] tracking-[0.18em] text-[var(--accent-soft)]'>Workspaces</p>
								<div className='grid gap-2 pl-3'>
									{workspaceItems.map((item) =>
										item.open ? (
											<a
												key={item.href}
												href={item.href}
												className='block transition hover:text-white'
												onClick={() => setIsMenuOpen(false)}
											>
												{item.label}
											</a>
										) : (
											<span
												key={item.href}
												className='flex items-center gap-2 text-white/50'
											>
												{item.label}
												<span className='text-[8px] tracking-[0.18em] text-white/50'>Soon</span>
											</span>
										),
									)}
								</div>
							</div>
							{navItems.map((item) => (
								<a
									key={item.href}
									className={`${navLinkClass(item.key)} border-b border-white/15 pb-3 last:border-b-0`}
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
