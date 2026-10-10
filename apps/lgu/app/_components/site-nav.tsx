'use client'

import { CaretDownIcon, HandHeartIcon, SquaresFourIcon } from '@phosphor-icons/react'
import { EASE, ScrollProgress, UtilityBar, useHeaderScroll, BrandLogo } from '@betterbarmm/editorial'
import { AnimatePresence, motion } from 'motion/react'
import { areaHref, lguProvinces } from '@betterbarmm/lgu-data'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { FinderTrigger } from './unit-finder'

/* The explainers: what each level does, how the region hands its powers down
   to them, and the code all of it rests on. */
const guides = [
	{ href: '/what-each-level-does', label: 'What each level does' },
	{ href: '/devolution', label: 'Devolution' },
	{ href: '/salaries', label: 'Salaries and benefits' },
	{ href: '/governance-code', label: 'Governance Code' },
] as const

/* The money: each unit's own books, and what the region's budget puts where. */
const finances = [
	{ href: '/finances', label: 'LGU finances' },
	{ href: '/regional-budget', label: 'Regional budget' },
] as const

/**
 * A menu that opens on click and closes on Escape or any pointer landing
 * outside it. A dropdown that only closes by clicking its own trigger feels
 * broken, and the panel is mounted and unmounted rather than hidden so it can
 * play out — one that vanishes on the frame you release the mouse reads as a
 * mis-click.
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
				data-open={open}
				className='nav-item flex cursor-pointer items-center gap-1.5'
			>
				{label}
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={{ duration: 0.3, ease: EASE }}
					className='text-[var(--ink-mute)]'
				>
					<CaretDownIcon size={13} weight='bold' aria-hidden='true' />
				</motion.span>
			</button>

			<AnimatePresence>
				{open ? (
					<motion.div
						initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
						animate={{ opacity: 1, y: 0, scaleY: 1 }}
						exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
						transition={{ duration: 0.24, ease: EASE }}
						style={{ originY: 0 }}
						className={`absolute right-0 top-full z-40 mt-1 border border-[var(--rule)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] ${width}`}
					>
						{children(() => setOpen(false))}
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	)
}

export function SiteNav() {
	const pathname = usePathname()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const { past, hidden } = useHeaderScroll(isMenuOpen)
	const closeMenu = () => setIsMenuOpen(false)

	const isProvinceActive =
		pathname === '/' || lguProvinces.some((province) => pathname.startsWith(`/${province.slug}`))
	const isGuideActive = guides.some((guide) => pathname.startsWith(guide.href))
	const isFinanceActive = finances.some((item) => pathname.startsWith(item.href))

	return (
		<>
			{/* The estate's strip, above the workspace's own bar. Not sticky:
			    it belongs to the top of the document, and the navigation a
			    reader actually needs mid-page is the bar under it. */}
			<UtilityBar
				base='https://betterbarmm.com'
				current='lgu'
				className='lgu-strip bg-[var(--paper-2)]'
				switchIcon={<SquaresFourIcon size={13} weight='bold' aria-hidden='true' />}
				end={
					<>
						<ThemeToggle size='size-7' />
						{/* Phones have no room for it in the strip; the wrapper hides it,
						    since the button's own display would beat `hidden`. */}
						<span className='hidden self-stretch sm:flex'>
							<a
								href='https://betterbarmm.com/contribute'
								target='_blank'
								rel='noreferrer'
								className='bb-btn bb-btn-accent !px-4 !py-0 !text-[9.5px]'
							>
								<HandHeartIcon size={13} weight='fill' aria-hidden='true' />
								Contribute
							</a>
						</span>
					</>
				}
			/>

			{/* The estate's masthead behaviour, the same on every workspace: it
			    takes a ground once the reader has left the top, and ducks out of the
			    way when they are reading down. `useHeaderScroll` also publishes the
			    flag the shared stylesheet reads to drop `--sticky-top`, so anything
			    sticking under this bar follows it up instead of leaving a band of
			    empty page. */}
		<motion.header
			animate={{ y: hidden ? '-100%' : '0%' }}
			transition={{ duration: 0.42, ease: EASE }}
			data-solid={past}
			className='sticky top-0 z-30 border-b border-[var(--brass-line)] bg-[var(--paper)]/86 backdrop-blur-xl'
		>
			<div className='mx-auto max-w-[88rem] px-8 sm:px-6 lg:px-8'>
				<div className='grid h-[calc(var(--site-header-h)-1px)] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:gap-2'>
					<div className='flex min-w-0 items-center gap-3'>
						<a href='https://betterbarmm.com' onClick={closeMenu} className='w-fit shrink-0'>
							<BrandLogo className='text-[var(--ink)]' />
						</a>
						<span aria-hidden='true' className='hidden h-5 w-px bg-[var(--rule)] sm:block' />
						{/* The wordmark says BetterBARMM; this says which of its
						    workspaces you are in. */}
						<Link
							href='/'
							onClick={closeMenu}
							className='hidden whitespace-nowrap font-[family-name:var(--font-display)] text-[10.5px] font-semibold uppercase leading-none tracking-[0.14em] text-[var(--brass)] transition hover:text-[var(--ink)] sm:block'
						>
							Local government
						</Link>
					</div>

					{/* The menus sit on one line from 1280px; below that the menu button carries them. */}
					<nav className='hidden items-center justify-end gap-1 whitespace-nowrap xl:flex'>
						{/* Three doors: the profiles of the places, how the system and its law
						    work, and the money. */}
						<Menu label='LGU profiles' active={isProvinceActive} width='w-[17rem]'>
							{(close) => [
								<Link key='all' href='/' onClick={close} className='nav-menu-item'>
									<span className='font-semibold'>All provinces and areas</span>
								</Link>,
								...lguProvinces.map((province) => (
									<Link
										key={province.slug}
										href={areaHref(province)}
										onClick={close}
										className='nav-menu-item'
									>
										<span>{province.name}</span>
										<span className='num text-[10.5px] text-[var(--ink-mute)]'>
											{province.municipalities.length}
										</span>
									</Link>
								)),
							]}
						</Menu>

						{/* The directory answers which unit you are in; the guides answer
						    what it is for and which law it runs on, which is the question a
						    reader who is not already a local government officer arrives with. */}
						<Menu label='Learn' active={isGuideActive} width='w-[17rem]'>
							{(close) =>
								guides.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={close}
										className='nav-menu-item'
									>
										<span className='whitespace-nowrap'>{item.label}</span>
									</Link>
								))
							}
						</Menu>

						<Menu label='Finances' active={isFinanceActive} width='w-[15rem]'>
							{(close) =>
								finances.map((item) => (
									<Link key={item.href} href={item.href} onClick={close} className='nav-menu-item'>
										<span className='whitespace-nowrap'>{item.label}</span>
									</Link>
								))
							}
						</Menu>
					</nav>

					<div className='flex items-center justify-end gap-1.5'>
						<FinderTrigger />
						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='lgu-mobile-menu'
							onClick={() => setIsMenuOpen((current) => !current)}
							className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--ink)] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] xl:hidden'
						>
							<span className='sr-only'>{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
							<span aria-hidden='true' className='flex h-2.5 w-4 flex-col justify-between'>
								<motion.span
									animate={isMenuOpen ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
									transition={{ duration: 0.3, ease: EASE }}
									className='block h-px bg-current'
								/>
								<motion.span
									animate={{ opacity: isMenuOpen ? 0 : 1 }}
									transition={{ duration: 0.2 }}
									className='block h-px bg-current'
								/>
								<motion.span
									animate={isMenuOpen ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
									transition={{ duration: 0.3, ease: EASE }}
									className='block h-px bg-current'
								/>
							</span>
						</button>
					</div>
				</div>
			</div>

			<AnimatePresence initial={false}>
				{isMenuOpen ? (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.34, ease: EASE }}
						className='overflow-hidden border-t border-[var(--rule)] bg-[var(--paper)] xl:hidden'
					>
						<nav
							id='lgu-mobile-menu'
							aria-label='Mobile navigation'
							className='mx-auto max-w-[88rem] px-8 py-6 sm:px-6 text-sm text-[var(--ink-2)] lg:px-8'
						>
							<p className='bb-label'>LGU profiles</p>
							<div className='mt-3 grid'>
								<Link href='/' onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 font-semibold'>
									All provinces and areas
								</Link>
								{lguProvinces.map((province) => (
									<Link
										key={province.slug}
										href={areaHref(province)}
										onClick={closeMenu}
										className='flex items-center justify-between gap-3 border-b border-[var(--rule-soft)] py-2.5'
									>
										{province.name}
										<span className='num text-[11px] text-[var(--ink-mute)]'>
											{province.municipalities.length}
										</span>
									</Link>
								))}
							</div>

							<p className='bb-label mt-7'>Learn</p>
							<div className='mt-3 grid'>
								{guides.map((item) => (
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

							<p className='bb-label mt-7'>Finances</p>
							<div className='mt-3 grid'>
								{finances.map((item) => (
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
						</nav>
					</motion.div>
				) : null}
			</AnimatePresence>

			<ScrollProgress />
		</motion.header>
		</>
	)
}
