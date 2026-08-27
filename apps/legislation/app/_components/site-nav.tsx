'use client'

import { CaretDownIcon, HandHeartIcon } from '@phosphor-icons/react'
import { Magnetic, ScrollProgress } from '@betterbarmm/editorial'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { categories } from '../_lib/categories'
import { ThemeToggle } from './theme-toggle'

/**
 * Who sits in the Parliament.
 *
 * Members and committees answer the same question — who — where the registry
 * answers what and the process pages answer how. A committee is a group of
 * these people, so the two belong behind one label rather than sitting as
 * separate top-level links.
 */
const peopleLinks = [
	{ href: '/members', label: 'Members' },
	{ href: '/committees', label: 'Committees' },
]

const secondaryLinks = [{ href: '/about', label: 'Data & Methodology' }]

/** Marks a category whose route exists but whose records aren't compiled yet. */
function SoonBadge() {
	return <span className='badge badge-plain badge-idle shrink-0'>Soon</span>
}

export function SiteNav() {
	const pathname = usePathname()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isRegistryOpen, setIsRegistryOpen] = useState(false)
	const [isPeopleOpen, setIsPeopleOpen] = useState(false)
	const registryRef = useRef<HTMLDivElement>(null)
	const peopleRef = useRef<HTMLDivElement>(null)

	// `/resolutions/adopted` should light up its own entry, not `/`, so match the
	// longest href rather than any prefix.
	const isActive = (href: string) =>
		href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

	const isRegistryActive = categories.some((category) => isActive(category.href))
	const isPeopleActive = peopleLinks.some((item) => isActive(item.href))

	const closeMenu = () => {
		setIsMenuOpen(false)
		setIsRegistryOpen(false)
		setIsPeopleOpen(false)
	}

	// A dropdown that only closes by clicking its own trigger feels broken, so
	// dismiss on Escape and on any pointer landing outside it.
	useEffect(() => {
		if (!isRegistryOpen && !isPeopleOpen) return

		const onPointerDown = (event: PointerEvent) => {
			if (!registryRef.current?.contains(event.target as Node)) setIsRegistryOpen(false)
			if (!peopleRef.current?.contains(event.target as Node)) setIsPeopleOpen(false)
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return
			setIsRegistryOpen(false)
			setIsPeopleOpen(false)
			}

		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)

		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [isRegistryOpen, isPeopleOpen])

	return (
		// A hairline under the bar, so a page scrolling beneath it has an edge to
		// sit against rather than sliding behind a floating row.
		//
		// The blur alone was doing the whole job of separating the bar from the
		// page, and a blur is not a background: a heading scrolling underneath
		// stayed dark enough to read straight through the nav links. The tint
		// gives it a ground, and the blur keeps what passes behind it as motion
		// rather than as legible text.
		<header className='sticky top-0 z-30 border-b border-[var(--brass-line)] bg-[var(--paper)]/86 backdrop-blur-xl'>
			<div className='bb-container'>
				{/* Three tracks so the links sit on the true centre of the header
				    rather than wherever the mark and controls leave room. */}
				{/* Two tracks on a phone, three from `md` up.
				 *
				 * The centre track holds a nav that is not rendered below `md`, so
				 * three equal-ish tracks gave the wordmark half the row and the
				 * controls the other half. The mark is a fixed-height image: the
				 * moment its share fell under its natural width, `max-width: 100%`
				 * squeezed it narrower while the inline height held, which is a
				 * wordmark rendered out of proportion. An `auto` track gives it
				 * exactly what it measures. */}
				<div className='grid h-[calc(var(--site-header-h)-1px)] grid-cols-[auto_1fr] items-center gap-4 md:grid-cols-[1fr_auto_1fr]'>
					<div className='flex items-center gap-3'>
						<a href='https://betterbarmm.com' onClick={closeMenu} className='w-fit shrink-0'>
							{/* `priority` because the mark sits at the top of every page —
							    lazy-loading it would leave a gap on first paint. */}
							<Image
								src='/logo.png'
								alt='BetterBARMM'
								width={142}
								height={26}
								priority
								className='logo-light max-w-none'
								style={{ height: 26, width: 'auto' }}
							/>
							<Image
								src='/logo-dark.png'
								alt='BetterBARMM'
								width={142}
								height={26}
								priority
								className='logo-dark max-w-none'
								style={{ height: 26, width: 'auto' }}
							/>
						</a>
						{/* The wordmark says BetterBARMM; this says which of its
						    workspaces you are in. Set as a label rather than as a link's
						    worth of body copy, so it reads as part of the mark. */}
						<Link
							href='/'
							onClick={closeMenu}
							className='hidden font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brass)] transition hover:text-[var(--ink)] sm:block'
						>
							Legislation
						</Link>
					</div>

					{/* No frame or fill — the links are grouped by proximity alone. The
					    blur stays on the bar so content scrolling underneath doesn't
					    collide with them. */}
					<nav className='hidden items-center gap-1 text-sm text-[var(--ink-3)] md:flex'>
						{/* The six Parliament record classes live behind one menu so the
						    header stays a single quiet row. */}
						<div ref={registryRef} className='relative'>
							<button
								type='button'
								aria-expanded={isRegistryOpen}
								aria-haspopup='menu'
								aria-controls='registry-menu'
								onClick={() => setIsRegistryOpen((current) => !current)}
								data-active={isRegistryActive}
								data-open={isRegistryOpen}
								className='nav-item flex cursor-pointer items-center gap-1.5'
							>
								Registry
								<CaretDownIcon
									size={13}
									weight='bold'
									aria-hidden='true'
									className={`text-[var(--ink-mute)] transition-transform duration-200 ${isRegistryOpen ? 'rotate-180' : ''}`}
								/>
							</button>

							<div
								id='registry-menu'
								className={`absolute left-1/2 top-full z-40 mt-3 w-[19rem] -translate-x-1/2 border border-[var(--ink)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[var(--brass)] before:content-[''] transition duration-200 ${
									isRegistryOpen
										? 'visible translate-y-0 opacity-100'
										: 'invisible -translate-y-1 opacity-0'
								}`}
							>
								{categories.map((category) => (
									<Link
										key={category.slug}
										href={category.href}
										onClick={closeMenu}
										data-active={isActive(category.href)}
										className='nav-menu-item data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
									>
										<span>{category.label}</span>
										{category.status === 'pending' ? <SoonBadge /> : null}
									</Link>
								))}
							</div>
						</div>

						{/* Members and committees answer the same question, so they share a
						    menu — "People" against the registry's "what". */}
						<div ref={peopleRef} className='relative'>
							<button
								type='button'
								aria-expanded={isPeopleOpen}
								aria-haspopup='menu'
								aria-controls='people-menu'
								onClick={() => setIsPeopleOpen((current) => !current)}
								data-active={isPeopleActive}
								data-open={isPeopleOpen}
								className='nav-item flex cursor-pointer items-center gap-1.5'
							>
								People
								<CaretDownIcon
									size={13}
									weight='bold'
									aria-hidden='true'
									className={`text-[var(--ink-mute)] transition-transform duration-200 ${isPeopleOpen ? 'rotate-180' : ''}`}
								/>
							</button>

							<div
								id='people-menu'
								className={`absolute left-1/2 top-full z-40 mt-3 w-[13rem] -translate-x-1/2 border border-[var(--ink)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[var(--brass)] before:content-[''] transition duration-200 ${
									isPeopleOpen
										? 'visible translate-y-0 opacity-100'
										: 'invisible -translate-y-1 opacity-0'
								}`}
							>
								{peopleLinks.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={closeMenu}
										data-active={isActive(item.href)}
										className='nav-menu-item !block data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
									>
										{item.label}
									</Link>
								))}
							</div>
						</div>

						{/* The registry counted rather than read one record at a time — what
						    the chamber actually legislates about. Plain links and not menus:
						    each is one page, and a caret that opens onto a single entry is a
						    control that wastes the click it asks for.

						    The two sit together on purpose. The first is the figures; the
						    second is where they came from and where they fall short, which
						    is the question the first one raises. It was in the phone menu
						    and nowhere in the bar. */}
						<Link href='/stats' data-active={isActive('/stats')} className='nav-item'>
							Stats
						</Link>

						{secondaryLinks.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								data-active={isActive(item.href)}
								className='nav-item'
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className='flex items-center justify-end gap-2 md:gap-1.5'>
						{/* The theme switch is a desktop control here. On a phone the row
						    is a mark, a call to action and a way into the registry, and a
						    fourth icon between them read as clutter — it is a setting,
						    which is what the menu panel is for. It moves there rather than
						    being duplicated, so there is only ever one of it. */}
						<div className='hidden items-center md:flex'>
							<ThemeToggle />
							<span className='w-1.5' aria-hidden='true' />
						</div>

						<Magnetic strength={0.22} className='hidden sm:inline-flex'>
							<a
								href='https://betterbarmm.com/contribute'
								target='_blank'
								rel='noreferrer'
								className='bb-btn bb-btn-accent !px-4 !py-2.5 !text-[10px]'
							>
								<HandHeartIcon size={15} weight='fill' aria-hidden='true' />
								Contribute
							</a>
						</Magnetic>

						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='legislation-mobile-menu'
							onClick={() => setIsMenuOpen((current) => !current)}
							className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--ink)] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] md:hidden'
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
			    page container.

			    Opaque rather than the bar's tint: a translucent panel is fine for a
			    row of links you glance at, and wrong for a list you read down with
			    the page showing through every entry. */}
			<div
				className={`border-[var(--rule)] transition-[border-width] duration-200 md:hidden ${
					isMenuOpen ? 'border-t bg-[var(--paper)]' : 'border-t-0'
				}`}
			>
				<nav
					id='legislation-mobile-menu'
					aria-label='Mobile navigation'
					className={`mx-auto grid max-w-[88rem] overflow-hidden px-6 text-sm text-[var(--ink-2)] transition-[grid-template-rows,opacity,margin,padding] duration-200 lg:px-8 ${
						isMenuOpen
							? 'mb-5 grid-rows-[1fr] pt-5 opacity-100'
							: 'mb-0 grid-rows-[0fr] pt-0 opacity-0'
					}`}
				>
					{/* Sixteen entries and four headings outrun a small phone, and the
					    menu lives inside a sticky header — so the overflow cannot be
					    scrolled to by scrolling the page, it simply sits below the fold
					    unreachable. Capping it against the viewport and letting the list
					    itself scroll is what makes the last entries gettable. Closed,
					    the clip is what lets the row collapse to nothing. */}
					<div
						className={`min-h-0 ${
							isMenuOpen
								? 'max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain'
								: 'overflow-hidden'
						}`}
					>
						<p className='bb-label'>Registry</p>
						<div className='mt-3 grid'>
							{categories.map((category) => (
								<Link
									key={category.slug}
									href={category.href}
									onClick={closeMenu}
									data-active={isActive(category.href)}
									className='flex items-center justify-between gap-3 border-b border-[var(--rule-soft)] py-2.5 data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
								>
									<span>{category.label}</span>
									{category.status === 'pending' ? <SoonBadge /> : null}
								</Link>
							))}
						</div>

						<p className='bb-label mt-7'>People</p>
						<div className='mt-3 grid'>
							{peopleLinks.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={closeMenu}
									data-active={isActive(item.href)}
									className='border-b border-[var(--rule-soft)] py-2.5 data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
								>
									{item.label}
								</Link>
							))}
						</div>

						<p className='bb-label mt-7'>Stats</p>
						<div className='mt-3 grid'>
							<Link
								href='/stats'
								onClick={closeMenu}
								data-active={isActive('/stats')}
								className='border-b border-[var(--rule-soft)] py-2.5 data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
							>
								The registry, counted
							</Link>
						</div>

						<p className='bb-label mt-7'>Project</p>
						<div className='mt-3 grid'>
							{secondaryLinks.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={closeMenu}
									data-active={isActive(item.href)}
									className='border-b border-[var(--rule-soft)] py-2.5 last:border-b-0 data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
								>
									{item.label}
								</Link>
							))}
						</div>

						{/* Last of the links: the one row here that changes the page rather
						    than leaving it. */}
						<p className='bb-label mt-7'>Appearance</p>
						<div className='mt-3 flex items-center justify-between gap-3 py-1'>
							Theme
							<span className='-mr-2 flex'>
								<ThemeToggle />
							</span>
						</div>

						{/* The bar drops Contribute below `sm` for room, which left a phone
						    with no way to reach it at all. It closes the menu instead. */}
						<a
							href='https://betterbarmm.com/contribute'
							target='_blank'
							rel='noreferrer'
							onClick={closeMenu}
							className='bb-btn bb-btn-accent mt-7 w-full sm:hidden'
						>
							<HandHeartIcon size={16} weight='fill' aria-hidden='true' />
							Contribute
						</a>
					</div>
				</nav>
			</div>

			{/* How far down the document the reader is. A record page runs to
			    several screens of statute, and a reader is entitled to know how
			    much of one they are in. */}
			<ScrollProgress />
		</header>
	)
}
