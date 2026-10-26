'use client'

import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* The estate's filter controls — a labelled select and a search field —
   so every explorer, in whichever workspace, filters with the same two
   boxes. Moved here from the procurement app, which drew them first. */

/** The box: a hairline and a tinted ground, or — `plain` — no box at all, the words and the arrow. */
const box = (plain: boolean) => (plain ? 'bg-transparent' : 'border border-[var(--rule)] bg-[var(--paper-2)] hover:border-[var(--ink)] focus:border-[var(--ink)]')

/**
 * A select whose list is drawn by the site rather than the browser.
 *
 * The browser's own list ignores the page: on the map dialog's dark header
 * it took the header's white text onto its own white ground and the options
 * vanished. This list is painted from the same tokens as whatever it sits
 * in — the dark ground in that header, the paper everywhere else — so it
 * always matches the bar it opens from.
 *
 * It opens as a popover, in the top layer, so a row that scrolls sideways
 * (the dialog's filters on a phone) cannot clip it; the tokens still
 * inherit from where it sits in the document. The trigger is a select-only
 * combobox: focus stays on it and the arrows move the highlighted option.
 */
export function Select({
	label,
	value,
	options,
	onChange,
	plain = false,
}: {
	label: string
	value: string
	options: [string, string][]
	onChange: (value: string) => void
	/** No box, no padding, the label beside the words rather than over them, the words semibold — a row of controls in a header rather than a form. */
	plain?: boolean
}) {
	const id = useId()
	const button = useRef<HTMLButtonElement>(null)
	const list = useRef<HTMLUListElement>(null)
	const [open, setOpen] = useState(false)
	const [active, setActive] = useState(0)
	const [place, setPlace] = useState<CSSProperties>({})
	const chosen = options.find(([key]) => key === value)?.[1] ?? ''
	const current = Math.max(0, options.findIndex(([key]) => key === value))

	// Placed under the trigger as it opens — or over it, when the screen has more room above.
	useEffect(() => {
		const el = list.current
		if (!el) return
		const onBefore = (event: Event) => {
			if ((event as ToggleEvent).newState !== 'open' || !button.current) return
			const r = button.current.getBoundingClientRect()
			const below = window.innerHeight - r.bottom - 12
			const up = below < 220 && r.top > below
			setPlace({
				left: Math.max(8, Math.min(r.left, window.innerWidth - 248)),
				minWidth: Math.max(r.width, 200),
				maxHeight: Math.min(360, up ? r.top - 12 : below),
				...(up ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
			})
			setActive(current)
		}
		const onToggle = (event: Event) => setOpen((event as ToggleEvent).newState === 'open')
		el.addEventListener('beforetoggle', onBefore)
		el.addEventListener('toggle', onToggle)
		return () => {
			el.removeEventListener('beforetoggle', onBefore)
			el.removeEventListener('toggle', onToggle)
		}
	}, [current])

	// While open: the highlighted option stays in view; the page moving under the list shuts it.
	useEffect(() => {
		if (!open) return
		list.current?.children[active]?.scrollIntoView({ block: 'nearest' })
	}, [open, active])
	useEffect(() => {
		if (!open) return
		const shut = (event: Event) => event.target !== list.current && list.current?.hidePopover()
		window.addEventListener('resize', shut)
		window.addEventListener('scroll', shut, true)
		return () => {
			window.removeEventListener('resize', shut)
			window.removeEventListener('scroll', shut, true)
		}
	}, [open])

	const pick = (i: number) => {
		const option = options[i]
		if (option) onChange(option[0])
		list.current?.hidePopover()
		button.current?.focus()
	}

	const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
		const last = options.length - 1
		if (!open) {
			if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
				event.preventDefault()
				list.current?.showPopover()
			}
			return
		}
		const move: Record<string, number> = { ArrowDown: Math.min(last, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: last, PageDown: Math.min(last, active + 8), PageUp: Math.max(0, active - 8) }
		if (event.key in move) {
			event.preventDefault()
			setActive(move[event.key]!)
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			pick(active)
		} else if (event.key === 'Tab') {
			list.current?.hidePopover()
		} else if (event.key.length === 1) {
			// Typing a letter jumps to the next option that starts with it.
			const k = event.key.toLowerCase()
			const next = options.findIndex(([, text], i) => i > active && text.toLowerCase().startsWith(k))
			const wrap = options.findIndex(([, text]) => text.toLowerCase().startsWith(k))
			if (next >= 0 || wrap >= 0) setActive(next >= 0 ? next : wrap)
		}
	}

	// A div rather than a label: a label forwards every click inside it to its
	// control, so a click on an option would land on the trigger and reopen the list.
	return (
		<div className={plain ? 'flex min-w-0 items-center gap-2' : 'flex min-w-0 flex-col gap-1'}>
			<span id={`${id}-label`} className={`whitespace-nowrap text-[var(--ink-3)] ${plain ? 'text-[0.875rem]' : 'text-[0.75rem]'}`}>
				{label}
			</span>
			<button
				ref={button}
				type='button'
				role='combobox'
				aria-labelledby={`${id}-label ${id}-value`}
				aria-haspopup='listbox'
				aria-expanded={open}
				aria-controls={`${id}-list`}
				aria-activedescendant={open ? `${id}-${active}` : undefined}
				popoverTarget={`${id}-list`}
				onKeyDown={onKey}
				className={`relative flex h-10 min-w-0 cursor-pointer items-center text-left text-[0.875rem] text-[var(--ink)] outline-none transition focus-visible:underline focus-visible:decoration-[var(--accent)] focus-visible:underline-offset-4 ${
					plain ? 'gap-2 whitespace-nowrap font-semibold' : 'w-full pl-3 pr-9'
				} ${box(plain)}`}
			>
				<span id={`${id}-value`} className='truncate'>
					{chosen}
				</span>
				{/* The site's arrow, inset like the search icon; it turns over while the list is open. */}
				<CaretDownIcon
					size={11}
					weight='bold'
					aria-hidden='true'
					className={`shrink-0 text-[var(--ink-3)] transition-transform ${open ? 'rotate-180' : ''} ${plain ? '' : 'absolute right-3 top-1/2 -mt-[5.5px]'}`}
				/>
			</button>
			<ul
				ref={list}
				id={`${id}-list`}
				role='listbox'
				aria-labelledby={`${id}-label`}
				popover='auto'
				style={place}
				className='fixed inset-auto m-0 overflow-y-auto border border-[var(--rule)] bg-[var(--paper)] p-1 text-[0.875rem] text-[var(--ink)] shadow-[0_16px_40px_rgba(0,0,0,0.28)] [scrollbar-width:thin]'
			>
				{options.map(([key, text], i) => (
					<li
						key={key}
						id={`${id}-${i}`}
						role='option'
						aria-selected={key === value}
						onClick={() => pick(i)}
						onPointerMove={() => i !== active && setActive(i)}
						className={`flex cursor-pointer items-center justify-between gap-6 whitespace-nowrap px-3 py-2 ${i === active ? 'bg-[var(--paper-3)]' : ''} ${key === value ? 'font-semibold' : 'text-[var(--ink-2)]'}`}
					>
						{text}
						{key === value ? <CheckIcon size={13} weight='bold' aria-hidden='true' className='shrink-0 text-[var(--accent)]' /> : null}
					</li>
				))}
			</ul>
		</div>
	)
}

/** The search field every explorer here opens with. */
export function SearchField({
	value,
	onChange,
	placeholder,
	plain = false,
}: {
	value: string
	onChange: (value: string) => void
	placeholder: string
	plain?: boolean
}) {
	return (
		<label className='flex w-full min-w-0 flex-col gap-1'>
			<span className={plain ? 'sr-only' : 'text-[0.75rem] text-[var(--ink-3)]'}>Search</span>
			<span className={`flex h-10 items-center gap-3 ${plain ? 'bg-transparent' : 'border border-[var(--rule)] bg-[var(--paper-2)] px-3 focus-within:border-[var(--ink)]'}`}>
				<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
				<input
					value={value}
					onChange={(event) => onChange(event.target.value)}
					type='search'
					autoComplete='off'
					spellCheck={false}
					placeholder={placeholder}
					className={`min-w-0 flex-1 bg-transparent text-[0.875rem] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden ${plain ? 'font-semibold' : ''}`}
				/>
			</span>
		</label>
	)
}
