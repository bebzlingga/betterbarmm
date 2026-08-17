'use client'

import { CaretDownIcon, HandHeartIcon } from '@phosphor-icons/react'
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

/**
 * How the institution works, in our own words.
 *
 * Parliament publishes all of this — as rules citations and statutory prose,
 * which is precise and unreadable. Each page here restates it plainly and
 * cites the rule behind every claim, so the menu keeps a reader on the site
 * instead of handing them a 34-rule document.
 */
const processLinks = [
	{
		href: '/how-parliament-works',
		label: 'Powers, limits, and the rulebook',
		blurb: 'What it can do, what holds it back, how a sitting runs, and how it votes.',
	},
	{
		href: '/legislative-process',
		label: 'How a measure becomes law',
		blurb: 'The path a bill takes, the shorter one a resolution takes, and where you can act.',
	},
	{
		href: '/questions',
		label: 'Common questions',
		blurb:
			'Short answers to what people actually ask, pointing at the pages that carry the full ones.',
	},
]

/** Marks a category whose route exists but whose records aren't compiled yet. */
function SoonBadge() {
	return <span className='badge badge-plain badge-idle shrink-0'>Soon</span>
}

export function SiteNav() {
	const pathname = usePathname()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isRegistryOpen, setIsRegistryOpen] = useState(false)
	const [isPeopleOpen, setIsPeopleOpen] = useState(false)
	const [isProcessOpen, setIsProcessOpen] = useState(false)
	const registryRef = useRef<HTMLDivElement>(null)
	const peopleRef = useRef<HTMLDivElement>(null)
	const processRef = useRef<HTMLDivElement>(null)

	// `/resolutions/adopted` should light up its own entry, not `/`, so match the
	// longest href rather than any prefix.
	const isActive = (href: string) =>
		href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

	const isRegistryActive = categories.some((category) => isActive(category.href))
	const isPeopleActive = peopleLinks.some((item) => isActive(item.href))
	const isProcessActive = processLinks.some((item) => isActive(item.href))

	const closeMenu = () => {
		setIsMenuOpen(false)
		setIsRegistryOpen(false)
		setIsPeopleOpen(false)
		setIsProcessOpen(false)
	}

	// A dropdown that only closes by clicking its own trigger feels broken, so
	// dismiss on Escape and on any pointer landing outside it.
	useEffect(() => {
		if (!isRegistryOpen && !isPeopleOpen && !isProcessOpen) return

		const onPointerDown = (event: PointerEvent) => {
			if (!registryRef.current?.contains(event.target as Node)) setIsRegistryOpen(false)
			if (!peopleRef.current?.contains(event.target as Node)) setIsPeopleOpen(false)
			if (!processRef.current?.contains(event.target as Node)) setIsProcessOpen(false)
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return
			setIsRegistryOpen(false)
			setIsPeopleOpen(false)
			setIsProcessOpen(false)
		}

		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)

		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [isRegistryOpen, isPeopleOpen, isProcessOpen])

	return (
		// A hairline under the bar, so a page scrolling beneath it has an edge to
		// sit against rather than sliding behind a floating row.
		<header className='sticky top-0 z-30 border-b border-[var(--rule)] backdrop-blur-md'>
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
						<Link
							href='/'
							onClick={closeMenu}
							className='hidden text-sm text-[var(--ink-3)] transition hover:text-[var(--ink)] sm:block'
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
								className='flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 transition hover:bg-[var(--paper)] hover:text-[var(--ink)] data-[active=true]:font-semibold data-[active=true]:text-[var(--ink)]'
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
								className={`absolute left-1/2 top-full z-40 mt-4 w-[19rem] -translate-x-1/2 rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper)] p-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.22)] transition duration-200 ${
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
										className='flex items-center justify-between gap-3 rounded-[var(--radius-sm)] px-3.5 py-3 text-[15px] transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)] data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
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
								className='flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 transition hover:bg-[var(--paper)] hover:text-[var(--ink)] data-[active=true]:font-semibold data-[active=true]:text-[var(--ink)]'
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
								className={`absolute left-1/2 top-full z-40 mt-4 w-[13rem] -translate-x-1/2 rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper)] p-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.22)] transition duration-200 ${
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
										className='block rounded-[var(--radius-sm)] px-3.5 py-3 text-[15px] text-[var(--ink)] transition hover:bg-[var(--paper-2)] data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
									>
										{item.label}
									</Link>
								))}
							</div>
						</div>

						{/* Parliament's own rules, kept in a menu of their own so it is
						    obvious these lead off the site. */}
						<div ref={processRef} className='relative'>
							<button
								type='button'
								aria-expanded={isProcessOpen}
								aria-haspopup='menu'
								aria-controls='process-menu'
								onClick={() => setIsProcessOpen((current) => !current)}
								data-active={isProcessActive}
								className='flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 transition hover:bg-[var(--paper)] hover:text-[var(--ink)] data-[active=true]:font-semibold data-[active=true]:text-[var(--ink)]'
							>
								How Parliament works
								<CaretDownIcon
									size={13}
									weight='bold'
									aria-hidden='true'
									className={`text-[var(--ink-mute)] transition-transform duration-200 ${isProcessOpen ? 'rotate-180' : ''}`}
								/>
							</button>

							<div
								id='process-menu'
								className={`absolute right-0 top-full z-40 mt-4 w-[22rem] rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--paper)] p-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.22)] transition duration-200 ${
									isProcessOpen
										? 'visible translate-y-0 opacity-100'
										: 'invisible -translate-y-1 opacity-0'
								}`}
							>
								{processLinks.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={closeMenu}
										data-active={isActive(item.href)}
										className='block rounded-[var(--radius-sm)] px-3.5 py-3 text-[15px] text-[var(--ink)] transition hover:bg-[var(--paper-2)] data-[active=true]:font-semibold data-[active=true]:text-[var(--accent)]'
									>
										<span>{item.label}</span>
										{/* A shade lighter than the label above it: the blurb is there to
										    be glanced at, not read down a list of three. `font-normal`
										    holds it there when the entry is active — the bold marks which
										    page you are on, and that is the label's job, not the blurb's. */}
										<span className='mt-1 block text-[13px] font-normal leading-5 text-[var(--ink-mute)]'>
											{item.blurb}
										</span>
									</Link>
								))}
							</div>
						</div>
					</nav>

					<div className='flex items-center justify-end gap-1.5'>
						<ThemeToggle />

						<span className='w-1.5' aria-hidden='true' />

						<a
							href='https://betterbarmm.com/contribute'
							target='_blank'
							rel='noreferrer'
							className='hidden items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[var(--accent-deep)] sm:inline-flex'
						>
							<HandHeartIcon size={16} weight='fill' aria-hidden='true' />
							Contribute
						</a>

						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='legislation-mobile-menu'
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
					id='legislation-mobile-menu'
					aria-label='Mobile navigation'
					className={`mx-auto grid max-w-[88rem] overflow-hidden px-6 text-sm text-[var(--ink-2)] transition-[grid-template-rows,opacity,margin,padding] duration-200 lg:px-8 ${
						isMenuOpen
							? 'mb-5 grid-rows-[1fr] pt-5 opacity-100'
							: 'mb-0 grid-rows-[0fr] pt-0 opacity-0'
					}`}
				>
					<div className='min-h-0 overflow-hidden'>
						<p className='label'>Registry</p>
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

						<p className='label mt-6'>People</p>
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

						<p className='label mt-6'>How Parliament works</p>
						<div className='mt-3 grid'>
							{processLinks.map((item) => (
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

						<p className='label mt-6'>Project</p>
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
					</div>
				</nav>
			</div>
		</header>
	)
}
