'use client'

import { CaretDownIcon, HandHeartIcon } from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './theme-toggle'

type SiteHeaderProps = {
	activeItem?: 'discover' | 'about' | 'contribute'
}

const discoverSections = [
	{ label: 'History', href: '/discover/history' },
	{ label: 'Government', href: '/discover/governance' },
	{ label: 'People', href: '/discover/people' },
	{ label: 'Culture & Places', href: '/discover/culture-places' },
] as const

const workspaces = [
	{ label: 'Election', href: 'https://election.betterbarmm.com', open: true },
	{ label: 'Legislation', href: 'https://bills.betterbarmm.com', open: true },
	{ label: 'Budget', href: 'https://budget.betterbarmm.com', open: false },
] as const

const secondaryLinks = [
	{ key: 'about', href: '/about', label: 'About' },
] as const

/** Marks a workspace whose site exists but whose data isn't published yet. */
function SoonBadge() {
	return <span className='badge badge-plain badge-idle shrink-0'>Soon</span>
}

/**
 * A menu that opens on click and closes on Escape or any pointer landing
 * outside it. Written once because the header carries two of them, and a
 * dropdown that only closes by clicking its own trigger feels broken.
 */
function Menu({
	label,
	active,
	width,
	children,
}: {
	label: string
	active?: boolean
	width: string
	children: (close: () => void) => React.ReactNode
}) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return

		const onPointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) setOpen(false)
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}

		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)

		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	return (
		<div ref={ref} className='relative'>
			<button
				type='button'
				aria-expanded={open}
				aria-haspopup='menu'
				onClick={() => setOpen((current) => !current)}
				data-active={active}
				className='flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)] data-[active=true]:bg-[var(--paper-2)] data-[active=true]:text-[var(--ink)]'
			>
				{label}
				<CaretDownIcon
					size={13}
					weight='bold'
					aria-hidden='true'
					className={`text-[var(--ink-mute)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			<div
				className={`absolute left-1/2 top-full z-40 mt-4 -translate-x-1/2 rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper)] p-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.22)] transition duration-200 ${width} ${
					open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
				}`}
			>
				{children(() => setOpen(false))}
			</div>
		</div>
	)
}

const menuItemClass =
	'flex items-center justify-between gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)]'

export function SiteHeader({ activeItem }: SiteHeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const closeMenu = () => setIsMenuOpen(false)

	return (
		// A hairline under the bar, so a page scrolling beneath it has an edge to
		// sit against rather than sliding behind a floating row.
		<header className='sticky top-0 z-30 border-b border-[var(--rule)] bg-[var(--paper)]/80 backdrop-blur-md'>
			<div className='mx-auto max-w-[88rem] px-6 lg:px-8'>
				{/* Three tracks so the links sit on the true centre of the header
				    rather than wherever the mark and controls leave room. */}
				<div className='grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4'>
					<div className='flex min-w-0 items-center gap-3'>
						<Link href='/' onClick={closeMenu} className='w-fit shrink-0'>
							{/* `priority` because the mark sits at the top of every page —
							    lazy-loading it would leave a gap on first paint. */}
							<Image
								src='/logo.png'
								alt='BetterBARMM'
								width={142}
								height={26}
								priority
								className='logo-light h-[26px] w-auto'
							/>
							<Image
								src='/logo-dark.png'
								alt='BetterBARMM'
								width={142}
								height={26}
								priority
								className='logo-dark h-[26px] w-auto'
							/>
						</Link>
					</div>

					{/* No frame or fill — the links are grouped by proximity alone. The
					    blur stays on the bar so content scrolling underneath doesn't
					    collide with them. */}
					<nav className='hidden items-center gap-1 text-sm text-[var(--ink-3)] md:flex'>
						<Menu label='Discover BARMM' active={activeItem === 'discover'} width='w-[15rem]'>
							{(close) =>
								discoverSections.map((item) => (
									<Link key={item.href} href={item.href} onClick={close} className={menuItemClass}>
										{item.label}
									</Link>
								))
							}
						</Menu>

						<Menu label='Workspaces' width='w-[17rem]'>
							{(close) =>
								workspaces.map((item) =>
									item.open ? (
										<a
											key={item.href}
											href={item.href}
											onClick={close}
											className={menuItemClass}
										>
											{item.label}
										</a>
									) : (
										<span
											key={item.href}
											className='flex items-center justify-between gap-3 px-3 py-2.5 text-[var(--ink-mute)]'
										>
											{item.label}
											<SoonBadge />
										</span>
									),
								)
							}
						</Menu>

						{secondaryLinks.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								data-active={activeItem === item.key}
								className='rounded-full px-3.5 py-1.5 transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)] data-[active=true]:bg-[var(--paper-2)] data-[active=true]:text-[var(--ink)]'
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className='flex items-center justify-end gap-1.5'>
						<ThemeToggle />

						<span className='w-1.5' aria-hidden='true' />

						<Link
							href='/contribute'
							className='hidden items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[var(--accent-deep)] sm:inline-flex'
						>
							<HandHeartIcon size={16} weight='fill' aria-hidden='true' />
							Contribute
						</Link>

						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='site-mobile-menu'
							onClick={() => setIsMenuOpen((current) => !current)}
							className='inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-[var(--rule)] text-[var(--ink)] transition hover:bg-[var(--paper-2)] md:hidden'
						>
							<span className='sr-only'>{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
							<span aria-hidden='true' className='flex h-2.5 w-4 flex-col justify-between'>
								<span
									className={`block h-px bg-current transition ${isMenuOpen ? 'translate-y-[4.5px] rotate-45' : ''}`}
								/>
								<span
									className={`block h-px bg-current transition ${isMenuOpen ? 'opacity-0' : ''}`}
								/>
								<span
									className={`block h-px bg-current transition ${isMenuOpen ? '-translate-y-[4.5px] -rotate-45' : ''}`}
								/>
							</span>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu — the rule sits on a full-width wrapper so it meets the
			    header's own border edge to edge; only the links are held to the
			    page container. */}
			<div
				className={`border-[var(--rule)] transition-[border-width] duration-200 md:hidden ${
					isMenuOpen ? 'border-t' : 'border-t-0'
				}`}
			>
				<nav
					id='site-mobile-menu'
					aria-label='Mobile navigation'
					className={`mx-auto grid max-w-[88rem] overflow-hidden px-6 text-sm text-[var(--ink-2)] transition-[grid-template-rows,opacity,margin,padding] duration-200 lg:px-8 ${
						isMenuOpen ? 'mb-5 grid-rows-[1fr] pt-5 opacity-100' : 'mb-0 grid-rows-[0fr] pt-0 opacity-0'
					}`}
				>
					<div className='min-h-0 overflow-hidden'>
						<p className='label label-strong'>Discover BARMM</p>
						<div className='mt-3 grid'>
							{discoverSections.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={closeMenu}
									className='border-b border-[var(--rule-soft)] py-2.5'
								>
									{item.label}
								</Link>
							))}
						</div>

						<p className='label label-strong mt-6'>Workspaces</p>
						<div className='mt-3 grid'>
							{workspaces.map((item) =>
								item.open ? (
									<a
										key={item.href}
										href={item.href}
										onClick={closeMenu}
										className='border-b border-[var(--rule-soft)] py-2.5'
									>
										{item.label}
									</a>
								) : (
									<span
										key={item.href}
										className='flex items-center justify-between gap-3 border-b border-[var(--rule-soft)] py-2.5 text-[var(--ink-mute)]'
									>
										{item.label}
										<SoonBadge />
									</span>
								),
							)}
						</div>

						<p className='label label-strong mt-6'>Project</p>
						<div className='mt-3 grid'>
							{secondaryLinks.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={closeMenu}
									data-active={activeItem === item.key}
									className='border-b border-[var(--rule-soft)] py-2.5 data-[active=true]:text-[var(--accent)]'
								>
									{item.label}
								</Link>
							))}
							<Link
								href='/contribute'
								onClick={closeMenu}
								data-active={activeItem === 'contribute'}
								className='py-2.5 data-[active=true]:text-[var(--accent)]'
							>
								Contribute
							</Link>
						</div>
					</div>
				</nav>
			</div>
		</header>
	)
}
